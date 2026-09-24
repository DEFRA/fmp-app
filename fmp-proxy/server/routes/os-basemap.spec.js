describe('os-basemap route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      FMPPROXYPORT: '8060',
      ordnanceSurveyOsGetCapabilitiesUrl: 'https://api.os.uk/maps/raster/v1/wmts',
      ordnanceSurveyOsMapsUrl: 'https://api.os.uk/maps/vector/v1/vts',
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

  describe('route configuration', () => {
    it('has correct HTTP methods', () => {
      const route = require('./os-basemap')
      expect(route.method).toEqual(['GET', 'POST'])
    })

    it('has correct path with wildcard', () => {
      const route = require('./os-basemap')
      expect(route.path).toBe('/proxy/basemap/{path*}')
    })

    it('disables authentication', () => {
      const route = require('./os-basemap')
      expect(route.options.auth).toBe(false)
    })

    it('uses proxy handler with mapUri', () => {
      const route = require('./os-basemap')
      expect(route.options.handler.proxy.passThrough).toBe(true)
      expect(typeof route.options.handler.proxy.mapUri).toBe('function')
    })
  })

  describe('WMTS path detection and handling', () => {
    it('detects WMTS requests by pathSegment === "wmts"', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-wmts' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: {},
        url: { pathname: '/proxy/basemap/wmts', search: '' }
      })

      const uri = new URL(result.uri)
      expect(uri.pathname).toBe('/maps/raster/v1/wmts')
      expect(logDebugMock).toHaveBeenCalledWith(
        'os basemap request received',
        expect.objectContaining({
          upstreamUrl: 'https://api.os.uk/maps/raster/v1/wmts?key=test-os-search-key'
        })
      )
    })

    it('uses custom WMTS target when provided in query', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-custom' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: { target: '/custom/wmts/path' },
        url: { pathname: '/proxy/basemap/wmts', search: '?target=/custom/wmts/path' }
      })

      const uri = new URL(result.uri)
      expect(uri.pathname).toBe('/custom/wmts/path')
      expect(uri.searchParams.get('target')).toBeNull() // target should be stripped
    })

    it('appends WMTS subpath when pathWithoutWmtsPrefix exists', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-subpath' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: { subpath: '1.0.0/WMTSCapabilities.xml' },
        url: { pathname: '/proxy/basemap/wmts', search: '?subpath=1.0.0/WMTSCapabilities.xml' }
      })

      const uri = new URL(result.uri)
      expect(uri.pathname).toBe('/maps/raster/v1/wmts')
      expect(uri.searchParams.get('subpath')).toBe('1.0.0/WMTSCapabilities.xml')
    })

    it('injects API key for WMTS requests', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: {},
        url: { pathname: '/proxy/basemap/wmts', search: '' }
      })

      const uri = new URL(result.uri)
      expect(uri.searchParams.get('key')).toBe('test-os-search-key')
    })

    it('preserves existing API key in WMTS requests', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: { key: 'custom-key' },
        url: { pathname: '/proxy/basemap/wmts', search: '?key=custom-key' }
      })

      const uri = new URL(result.uri)
      expect(uri.searchParams.get('key')).toBe('custom-key')
    })

    it('filters out type and target parameters for WMTS', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: { type: 'wmts', target: '/maps/raster/v1/wmts', LAYER: 'Outdoor_27700' },
        url: { pathname: '/proxy/basemap/wmts', search: '?type=wmts&target=/maps/raster/v1/wmts&LAYER=Outdoor_27700' }
      })

      const uri = new URL(result.uri)
      expect(uri.searchParams.get('type')).toBeNull()
      expect(uri.searchParams.get('target')).toBeNull()
      expect(uri.searchParams.get('LAYER')).toBe('Outdoor_27700')
    })

    it('forwards other WMTS query parameters', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: { LAYER: 'Outdoor_27700', REQUEST: 'GetTile', FORMAT: 'image/png' },
        url: { pathname: '/proxy/basemap/wmts', search: '?LAYER=Outdoor_27700&REQUEST=GetTile&FORMAT=image/png' }
      })

      const uri = new URL(result.uri)
      expect(uri.searchParams.get('LAYER')).toBe('Outdoor_27700')
      expect(uri.searchParams.get('REQUEST')).toBe('GetTile')
      expect(uri.searchParams.get('FORMAT')).toBe('image/png')
    })
  })

  describe('vector path handling', () => {
    it('routes non-WMTS requests to vector endpoint', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'styles/road.json' },
        query: {},
        url: { pathname: '/proxy/basemap/styles/road.json', search: '' }
      })

      const uri = new URL(result.uri)
      expect(uri.pathname).toBe('/styles/road.json')
    })

    it('uses default vector target when path is empty', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-default' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: '' },
        query: {},
        url: { pathname: '/proxy/basemap', search: '' }
      })

      const uri = new URL(result.uri)
      expect(uri.pathname).toBe('/maps/vector/v1/vts')
    })

    it('filters out type and target parameters for vector', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: '' },
        query: { type: 'vector', target: '/maps/vector/v1/vts', epsg: '27700' },
        url: { pathname: '/proxy/basemap', search: '?type=vector&target=/maps/vector/v1/vts&epsg=27700' }
      })

      const uri = new URL(result.uri)
      expect(uri.searchParams.get('type')).toBeNull()
      expect(uri.searchParams.get('target')).toBeNull()
      expect(uri.searchParams.get('epsg')).toBe('27700')
    })

    it('forwards other vector query parameters', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'os-token-vector' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'styles/road.json' },
        query: { epsg: '27700', slds: 'true' },
        url: { pathname: '/proxy/basemap/styles/road.json', search: '?epsg=27700&slds=true' }
      })

      const uri = new URL(result.uri)
      expect(uri.searchParams.get('epsg')).toBe('27700')
      expect(uri.searchParams.get('slds')).toBe('true')
    })
  })

  describe('authorization header', () => {
    it('includes Bearer token in response headers', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'test-bearer-token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: {},
        url: { pathname: '/proxy/basemap/wmts', search: '' }
      })

      expect(result.headers).toEqual({ authorization: 'Bearer test-bearer-token' })
    })

    it('fetches token for every request', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'new-token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: {},
        url: { pathname: '/proxy/basemap/wmts', search: '' }
      })

      expect(getOsTokenMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('request URL logging', () => {
    it('logs the incoming request URL', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: { key: 'test' },
        url: { pathname: '/proxy/basemap/wmts', search: '?key=test' }
      })

      expect(logDebugMock).toHaveBeenCalledWith(
        'os basemap request received',
        expect.objectContaining({
          requestUrl: '/proxy/basemap/wmts?key=test'
        })
      )
    })

    it('logs the upstream URL', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: {},
        url: { pathname: '/proxy/basemap/wmts', search: '' }
      })

      expect(logDebugMock).toHaveBeenCalledWith(
        'os basemap request received',
        expect.objectContaining({
          upstreamUrl: expect.stringContaining('https://api.os.uk')
        })
      )
    })

    it('logs the HTTP method', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      await route.options.handler.proxy.mapUri({
        method: 'POST',
        params: { path: 'wmts' },
        query: {},
        url: { pathname: '/proxy/basemap/wmts', search: '' }
      })

      expect(logDebugMock).toHaveBeenCalledWith(
        'os basemap request received',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('edge cases and error scenarios', () => {
    it('handles empty query parameters', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts' },
        query: null,
        url: { pathname: '/proxy/basemap/wmts', search: '' }
      })

      expect(result.uri).toContain('https://api.os.uk')
    })

    it('handles missing trailing slashes in wmtsBasePath', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { path: 'wmts/test' },
        query: { target: '/maps/raster/v1/wmts/' },
        url: { pathname: '/proxy/basemap/wmts/test', search: '?target=/maps/raster/v1/wmts/' }
      })

      const uri = new URL(result.uri)
      // Should not have double slashes
      expect(uri.pathname).not.toMatch(/\/\//)
    })

    it('processes POST requests', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-basemap')
      const result = await route.options.handler.proxy.mapUri({
        method: 'POST',
        params: { path: 'wmts' },
        query: { REQUEST: 'GetTile' },
        url: { pathname: '/proxy/basemap/wmts', search: '?REQUEST=GetTile' }
      })

      expect(result.uri).toBeDefined()
      expect(result.headers).toBeDefined()
    })
  })
})
