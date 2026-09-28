describe('esri-proxy route', () => {
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
      OS_TOKEN_URL: 'https://api.os.uk/oauth2/token/v1',
      ESRI_TOKEN_DURATION_MINUTES: '120'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('injects a server-side ESRI token and preserves normal query params', async () => {
    const logDebugMock = jest.fn()
    const getEsriTokenMock = jest.fn().mockResolvedValue({ token: 'server-esri-token' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getEsriToken', () => ({
      getEsriToken: getEsriTokenMock
    }))

    const route = require('./esri-proxy')

    expect(route.method).toEqual(['GET', 'POST'])
    expect(route.path).toBe('/proxy/esri/{path*}')

    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'FeatureServer/0/query'
      },
      query: {
        f: 'json',
        token: 'browser-token',
        outFields: 'OBJECTID'
      },
      url: {
        pathname: '/proxy/esri/FeatureServer/0/query',
        search: '?f=json&token=browser-token&outFields=OBJECTID'
      }
    })

    const uri = new URL(result.uri)

    expect(getEsriTokenMock).toHaveBeenCalledTimes(1)
    expect(uri.origin).toBe('https://services1.arcgis.com')
    expect(uri.pathname).toBe('/test-service-id/arcgis/rest/services/FeatureServer/0/query')
    expect(uri.searchParams.get('f')).toBe('json')
    expect(uri.searchParams.get('outFields')).toBe('OBJECTID')
    expect(uri.searchParams.get('token')).toBe('server-esri-token')
    expect(logDebugMock).toHaveBeenCalledWith('esri request received', expect.objectContaining({
      method: 'GET',
      routePath: 'FeatureServer/0/query'
    }))
  })
})
