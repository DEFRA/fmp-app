const hapi = require('@hapi/hapi')
const { config: mockConfig } = require('../../../config')
jest.mock('../../services/getHostAndProtocol', () => ({ getHostAndProtocol: jest.fn() }))

const startServer = async (mockEnv, mockFmpProxyUrl) => {
  jest.mock('../../../config', () => ({
    config: {
      ...mockConfig,
      env: mockEnv,
      fmpProxyUrl: mockFmpProxyUrl
    }
  }))
  const server = hapi.server({})
  const route = require('../defra-map/map-config')
  server.route(route)
  await server.start()
  return server
}

describe('map-config', () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.spyOn(Date, 'now').mockImplementation(() => 1770024023142)
  })

  afterAll(jest.clearAllMocks)

  it('Should get /defra-map/config successfully when env is dev', async () => {
    require('../../services/getHostAndProtocol').getHostAndProtocol.mockReturnValue('http://fmp-app')
    const server = await startServer('dev')
    const response = await server.inject({ method: 'GET', url: '/defra-map/config' })
    expect(response.result).toMatchSnapshot()
    await expect(response.result.version).toEqual('925617123')
    await server.stop()
  })

  it('Should get /defra-map/config successfully when env is local', async () => {
    const server = await startServer('local', 'http://fmp-proxy')
    const response = await server.inject({ method: 'GET', url: '/defra-map/config' })
    expect(response.result).toMatchSnapshot()
    await expect(response.result.version).toEqual(1770024023142)
    await server.stop()
  })
})
