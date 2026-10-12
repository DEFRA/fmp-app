const mockFetch = jest.fn()
global.fetch = mockFetch

describe('getDefraMapConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    global.fetch = jest.fn()
  })

  it('should fetch config from /defra-map/config endpoint', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ fmpProxyUrl: 'http://localhost:3005' })
    })

    const { getDefraMapConfig } = require('./mapConfig.js')
    const config = await getDefraMapConfig()

    expect(global.fetch).toHaveBeenCalledWith('/defra-map/config')
    expect(config.fmpProxyUrl).toBe('http://localhost:3005')
  })

  it('should cache the config and not fetch again on second call', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ fmpProxyUrl: 'http://localhost:3005' })
    })

    const { getDefraMapConfig } = require('./mapConfig.js')
    await getDefraMapConfig()
    await getDefraMapConfig()

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
