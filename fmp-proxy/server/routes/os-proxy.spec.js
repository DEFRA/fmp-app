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

  it('creates a route that injects a bearer token and adds the OS search key when needed', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-123' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-proxy')

    expect(route.method).toEqual(['GET', 'POST'])
    expect(route.path).toBe('/proxy/os/{path*}')
    expect(route.options.auth).toBe(false)

    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'search/names/v1/find'
      },
      query: {
        query: 'test',
        maxresults: '8'
      },
      url: {
        pathname: '/proxy/os/search/names/v1/find',
        search: '?query=test&maxresults=8'
      }
    })

    const uri = new URL(result.uri)

    expect(getOsTokenMock).toHaveBeenCalledTimes(1)
    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/search/names/v1/find')
    expect(uri.searchParams.get('query')).toBe('test')
    expect(uri.searchParams.get('maxresults')).toBe('8')
    expect(uri.searchParams.get('key')).toBe('test-os-search-key')
    expect(result.headers).toEqual({ authorization: 'Bearer os-token-123' })

    expect(logDebugMock).toHaveBeenCalledWith('os request received', expect.objectContaining({
      method: 'GET',
      requestUrl: '/proxy/os/search/names/v1/find?query=test&maxresults=8',
      routePath: 'search/names/v1/find'
    }))
    expect(logDebugMock).toHaveBeenCalledWith('os upstream resolved', expect.objectContaining({
      upstreamUrl: 'https://api.os.uk/search/names/v1/find',
      hasQueryString: true
    }))
  })

  it('handles requests without a path query or url details', async () => {
    const logDebugMock = jest.fn()
    const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'fallback-token' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getOsToken', () => ({
      getOsToken: getOsTokenMock
    }))

    const route = require('./os-proxy')

    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {},
      query: undefined,
      url: undefined
    })

    const uri = new URL(result.uri)

    expect(getOsTokenMock).toHaveBeenCalledTimes(1)
    expect(uri.origin).toBe('https://api.os.uk')
    expect(uri.pathname).toBe('/')
    expect(result.headers).toEqual({ authorization: 'Bearer fallback-token' })
    expect(logDebugMock).toHaveBeenCalledWith('os request received', expect.objectContaining({
      method: 'GET',
      requestUrl: 'unknown',
      routePath: ''
    }))
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

    const route = require('./os-proxy')

    await expect(route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'maps/raster/v1/wmts'
      },
      query: {},
      url: {
        pathname: '/proxy/os/maps/raster/v1/wmts',
        search: ''
      }
    })).rejects.toThrow('token failed')

    expect(logDebugMock).toHaveBeenCalledWith('os token fetch failed', {
      message: 'token failed'
    })
  })
})
