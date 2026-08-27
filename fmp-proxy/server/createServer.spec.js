describe('createServer', () => {
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

  it('can instantiate a server', async () => {
    const createServer = require('./createServer')
    const server = await createServer()

    expect(server.settings.port).toEqual(8060)

    await server.stop()
  })

  it('logs proxy completion and failure details for proxy requests', async () => {
    process.env.PROXY_DEBUG = 'true'
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const createServer = require('./createServer')
    const server = await createServer()

    await server.route({
      method: 'GET',
      path: '/proxy/success',
      handler: () => ({ ok: true })
    })

    await server.inject({ method: 'GET', url: '/proxy/success' })
    await server.inject({ method: 'GET', url: '/proxy/not-found' })

    const loggedMessages = consoleSpy.mock.calls.map(([message]) => message)

    expect(loggedMessages.some((message) => message.includes('proxy response completed'))).toBe(true)
    expect(loggedMessages.some((message) => message.includes('proxy request failed'))).toBe(true)

    await server.stop()
  })
})
