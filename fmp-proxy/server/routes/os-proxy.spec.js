describe('os-proxy route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      FMPPROXYPORT: '8060',
      agolClientId: 'agol-client-id',
      agolClientSecret: 'agol-client-secret',
      agolServiceId: 'test-service-id',
      ordnanceSurveyOsGetCapabilitiesUrl: 'https://api.os.uk/maps/raster/v1/wmts',
      ordnanceSurveyOsMapsUrl: 'https://api.os.uk/maps/vector/v1/vts',
      ordnanceSurveyOsNamesUrl: 'https://api.os.uk/search/names/v1/find?maxresults=1&key=test',
      ordnanceSurveyOsSearchKey: 'test-os-search-key',
      ordnanceSurveyOsClientId: 'os-client-id',
      ordnanceSurveyOsClientSecret: 'os-client-secret',
      OS_TOKEN_URL: 'https://api.os.uk/oauth2/token/v1'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('creates a route that injects a bearer token and resolves a vague place lookup path', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-123' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-place-lookup')

    expect(route.method).toEqual(['GET', 'POST'])
    expect(route.path).toBe('/proxy/place-lookup/{query}')
    expect(route.options.auth).toBe(false)

    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        query: 'Brighton%20and%20Hove'
      },
      query: {
        limit: '10'
      },
      url: {
        pathname: '/proxy/place-lookup/Brighton%20and%20Hove',
        search: '?limit=10'
      }
    })

    const uri = new URL(result.uri)

    expect(getOsTokenMock).toHaveBeenCalledTimes(1)
    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/search/names/v1/find')
    expect(uri.searchParams.get('query')).toBe('Brighton and Hove')
    expect(uri.searchParams.get('maxresults')).toBe('8')
    expect(uri.searchParams.get('key')).toBe('test-os-search-key')
    expect(uri.searchParams.get('fq')).toContain('LOCAL_TYPE:City')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-123' })

    expect(logDebugMock).toHaveBeenCalledWith('os request received', expect.objectContaining({
      method: 'GET',
      requestUrl: '/proxy/place-lookup/Brighton%20and%20Hove?limit=10',
      routePath: 'place-lookup/Brighton and Hove'
    }))
    expect(logDebugMock).toHaveBeenCalledWith('os upstream resolved', expect.objectContaining({
      upstreamUrl: 'https://api.os.uk/search/names/v1/find',
      hasQueryString: true
    }))
  })

  it('routes real WMTS KVP requests to the OS raster service even without a type flag', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-xyz' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'wmts'
      },
      query: {
        REQUEST: 'GetTile',
        LAYER: 'Outdoor_27700',
        TILEMATRIXSET: 'EPSG:27700',
        TILEMATRIX: '10',
        TILEROW: '377',
        TILECOL: '559',
        FORMAT: 'image/png'
      },
      url: {
        pathname: '/proxy/basemap/wmts',
        search: '?REQUEST=GetTile&LAYER=Outdoor_27700'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/raster/v1/wmts')
    expect(uri.searchParams.get('REQUEST')).toBe('GetTile')
    expect(uri.searchParams.get('LAYER')).toBe('Outdoor_27700')
    expect(uri.searchParams.get('key')).toBe('test-os-search-key')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-xyz' })
  })

  it('accepts a wildcard basemap path and resolves WMTS capabilities requests', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-capabilities' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')

    expect(route.path).toBe('/proxy/basemap/{path*}')

    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'wmts'
      },
      query: {},
      url: {
        pathname: '/proxy/basemap/wmts',
        search: ''
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/raster/v1/wmts')
    expect(uri.searchParams.get('key')).toBe('test-os-search-key')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-capabilities' })
  })

  it('keeps an existing WMTS key and supports request-based WMTS detection', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-wmts-existing-key' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'wmts'
      },
      query: {
        REQUEST: 'GetTile',
        LAYER: 'Outdoor_27700',
        key: 'existing-os-key'
      },
      url: {
        pathname: '/proxy/basemap/wmts',
        search: '?REQUEST=GetTile&LAYER=Outdoor_27700&key=existing-os-key'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/raster/v1/wmts')
    expect(uri.searchParams.get('REQUEST')).toBe('GetTile')
    expect(uri.searchParams.get('LAYER')).toBe('Outdoor_27700')
    expect(uri.searchParams.get('key')).toBe('existing-os-key')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-wmts-existing-key' })
  })

  it('routes vector basemap requests to the OS vector service and preserves the path', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'styles/road.json'
      },
      query: {},
      url: {
        pathname: '/proxy/basemap/styles/road.json',
        search: ''
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/styles/road.json')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-vector' })
  })

  it('uses the default OS vector basemap endpoint when no path is supplied', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-default-vector' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      query: {
        type: 'vector'
      },
      url: {
        pathname: '/proxy/basemap',
        search: '?type=vector'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/vector/v1/vts')
    expect(uri.searchParams.get('type')).toBeNull()
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-default-vector' })
  })

  it('forwards non-routing vector params to the OS vector service', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector-params' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'styles/road.json'
      },
      query: {
        epsg: '27700'
      },
      url: {
        pathname: '/proxy/basemap/styles/road.json',
        search: '?epsg=27700'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/styles/road.json')
    expect(uri.searchParams.get('epsg')).toBe('27700')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-vector-params' })
  })

  it('uses a custom vector target when provided by the caller', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-custom-vector' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      query: {
        type: 'vector',
        target: '/maps/vector/v1/vts'
      },
      url: {
        pathname: '/proxy/basemap',
        search: '?type=vector&target=/maps/vector/v1/vts'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/vector/v1/vts')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-custom-vector' })
  })

  it('skips routing-only WMTS query keys while keeping real params', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-wmts-routing-keys' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'wmts'
      },
      query: {
        target: '/maps/raster/v1/wmts',
        LAYER: 'Outdoor_27700',
        key: 'existing-wmts-key'
      },
      url: {
        pathname: '/proxy/basemap/wmts',
        search: '?target=/maps/raster/v1/wmts&LAYER=Outdoor_27700&key=existing-wmts-key'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/raster/v1/wmts')
    expect(uri.searchParams.get('LAYER')).toBe('Outdoor_27700')
    expect(uri.searchParams.get('target')).toBeNull()
    expect(uri.searchParams.get('key')).toBe('existing-wmts-key')
  })

  it('drops only the type key for WMTS requests', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-wmts-type-only' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'wmts'
      },
      query: {
        LAYER: 'Outdoor_27700'
      },
      url: {
        pathname: '/proxy/basemap/wmts',
        search: '?LAYER=Outdoor_27700'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/raster/v1/wmts')
    expect(uri.searchParams.get('LAYER')).toBe('Outdoor_27700')
  })

  it('drops only the target key for WMTS requests', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-wmts-target-only' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'wmts'
      },
      query: {
        target: '/maps/raster/v1/wmts',
        LAYER: 'Outdoor_27700'
      },
      url: {
        pathname: '/proxy/basemap/wmts',
        search: '?target=/maps/raster/v1/wmts&LAYER=Outdoor_27700'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/raster/v1/wmts')
    expect(uri.searchParams.get('LAYER')).toBe('Outdoor_27700')
    expect(uri.searchParams.get('target')).toBeNull()
  })

  it('treats a bare vector request as default vector basemap when no type or path is supplied', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-default-bare-vector' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      query: {},
      url: {
        pathname: '/proxy/basemap',
        search: ''
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/vector/v1/vts')
    expect(uri.searchParams.get('key')).toBeNull()
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-default-bare-vector' })
  })

  it('handles a request without url metadata and routing-only type and target keys', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-routing-only' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'wmts'
      },
      query: {
        target: '/maps/raster/v1/wmts'
      },
      url: {
        pathname: '/proxy/basemap/wmts',
        search: '?target=/maps/raster/v1/wmts'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/raster/v1/wmts')
    expect(uri.searchParams.get('key')).toBe('test-os-search-key')
    expect(uri.searchParams.get('target')).toBeNull()
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-routing-only' })
    expect(logDebugMock).toHaveBeenCalledWith('os basemap request received', expect.objectContaining({
      upstreamUrl: 'https://api.os.uk/maps/raster/v1/wmts?key=test-os-search-key'
    }))
  })

  it('skips routing-only vector query keys while keeping real params', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector-routing-keys' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      query: {
        target: '/maps/vector/v1/vts',
        epsg: '27700'
      },
      url: {
        pathname: '/proxy/basemap',
        search: '?type=vector&target=/maps/vector/v1/vts&epsg=27700'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/vector/v1/vts')
    expect(uri.searchParams.get('epsg')).toBe('27700')
    expect(uri.searchParams.get('type')).toBeNull()
    expect(uri.searchParams.get('target')).toBeNull()
  })

  it('drops only the type key for vector requests', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector-type-only' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      query: {
        type: 'vector',
        epsg: '27700'
      },
      url: {
        pathname: '/proxy/basemap',
        search: '?type=vector&epsg=27700'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/vector/v1/vts')
    expect(uri.searchParams.get('epsg')).toBe('27700')
    expect(uri.searchParams.get('type')).toBeNull()
  })

  it('drops only the target key for vector requests', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector-target-only' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-basemap')
    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      query: {
        target: '/maps/vector/v1/vts',
        epsg: '27700'
      },
      url: {
        pathname: '/proxy/basemap',
        search: '?target=/maps/vector/v1/vts&epsg=27700'
      }
    })

    const uri = new URL(result.uri)

    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/maps/vector/v1/vts')
    expect(uri.searchParams.get('epsg')).toBe('27700')
    expect(uri.searchParams.get('target')).toBeNull()
  })

  it('rejects empty or invalid place lookup queries', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'fallback-token' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-place-lookup')

    await expect(route.options.handler.proxy.mapUri({
      method: 'GET',
      params: { query: '   ' },
      query: {},
      url: { pathname: '/proxy/place-lookup/   ', search: '' }
    })).rejects.toThrow('Invalid place lookup query')

    await expect(route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {},
      query: {},
      url: { pathname: '/proxy/place-lookup', search: '' }
    })).rejects.toThrow('Invalid place lookup query')
  })

  it('throws when the OS token fetch fails', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockRejectedValue(new Error('token failed'))

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-place-lookup')

    await expect(route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        query: 'Brighton'
      },
      query: {},
      url: {
        pathname: '/proxy/place-lookup/Brighton',
        search: ''
      }
    })).rejects.toThrow('token failed')

    expect(logDebugMock).toHaveBeenCalledWith('os token fetch failed', {
      message: 'token failed'
    })
  })
})
