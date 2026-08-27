describe('esri-geocode-proxy route', () => {
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

  it('uses the geocode service base URL and injects the server token', async () => {
    const logDebugMock = jest.fn()
    const getEsriTokenMock = jest.fn().mockResolvedValue({ token: 'geocode-token' })

    jest.doMock('../services/proxyDebug', () => ({
      logDebug: logDebugMock
    }))
    jest.doMock('../services/getEsriToken', () => ({
      getEsriToken: getEsriTokenMock
    }))

    const route = require('./esri-geocode-proxy')

    const result = await route.options.handler.proxy.mapUri({
      method: 'GET',
      params: {
        path: 'World/GeocodeServer/findAddressCandidates'
      },
      query: {
        token: 'browser-token',
        singleLine: 'London'
      },
      url: {
        pathname: '/proxy/esri-geocode/World/GeocodeServer/findAddressCandidates',
        search: '?token=browser-token&singleLine=London'
      }
    })

    const uri = new URL(result.uri)

    expect(getEsriTokenMock).toHaveBeenCalledTimes(1)
    expect(uri.origin).toBe('https://geocode-api.arcgis.com')
    expect(uri.pathname).toBe('/arcgis/rest/services/World/GeocodeServer/findAddressCandidates')
    expect(uri.searchParams.get('singleLine')).toBe('London')
    expect(uri.searchParams.get('token')).toBe('geocode-token')
    expect(logDebugMock).toHaveBeenCalledWith('esri geocode request received', expect.objectContaining({
      method: 'GET',
      routePath: 'World/GeocodeServer/findAddressCandidates'
    }))
  })
})
