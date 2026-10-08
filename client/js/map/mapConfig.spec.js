import { setupEsriConfig } from './mapConfig.js'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('setupEsriConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    mockFetch.mockResolvedValue({
      json: async () => ({ fmpProxyUrl: 'http://localhost:3005' })
    })
  })

  it('should push interceptors when esriConfig has request.interceptors', async () => {
    const esriConfig = {
      request: {
        interceptors: []
      }
    }

    await setupEsriConfig(esriConfig)

    expect(esriConfig.request.interceptors.length).toBe(1)
    expect(esriConfig.request.interceptors[0]).toEqual(
      expect.objectContaining({
        urls: 'https://api.os.uk/'
      })
    )
  })

  it('should not push interceptors when esriConfig does not have request.interceptors', async () => {
    const esriConfig = {
      request: {}
    }

    await setupEsriConfig(esriConfig)

    expect(esriConfig.request.interceptors).toBeUndefined()
  })

  it('should not push interceptors when esriConfig.request is undefined', async () => {
    const esriConfig = {}

    await setupEsriConfig(esriConfig)

    expect(esriConfig.request).toBeUndefined()
  })

  it('should use the fmpProxyUrl from config for the interceptor', async () => {
    const esriConfig = {
      request: {
        interceptors: []
      }
    }

    await setupEsriConfig(esriConfig)

    const interceptor = esriConfig.request.interceptors[0]
    const params = { url: 'https://api.os.uk/maps/v1/test' }
    await interceptor.before(params)

    expect(params.url).toBe('http://localhost:3005/basemap/maps/v1/test')
  })

  it('should handle multiple interceptors', async () => {
    const esriConfig = {
      request: {
        interceptors: []
      }
    }

    await setupEsriConfig(esriConfig)

    expect(esriConfig.request.interceptors.length).toBeGreaterThan(0)
  })
})

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
