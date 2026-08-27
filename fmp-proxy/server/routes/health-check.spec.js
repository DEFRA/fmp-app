describe('GET /health-check', () => {
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
      ordnanceSurveyOsClientSecret: 'os-client-secret'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns 200 and service payload', async () => {
    const createServer = require('../createServer')
    const server = await createServer()

    const response = await server.inject({ method: 'GET', url: '/health-check' })

    expect(response.statusCode).toEqual(200)
    expect(response.result).toEqual({ ok: true, service: 'fmp-proxy' })

    await server.stop()
  })
})
