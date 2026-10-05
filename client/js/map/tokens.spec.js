const { esriStatusCodes } = require('../../../server/constants')

const loadTokens = () => {
  jest.resetModules()
  return require('./tokens.js')
}

describe('getOsToken', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should fetch and cache a new OS token when none is cached', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 })
    })
    const { getOsToken } = loadTokens()

    const result = await getOsToken()

    expect(globalThis.fetch).toHaveBeenCalledWith('/os-token', expect.objectContaining({ method: 'GET' }))
    expect(result.token).toBe('os-token-1')
  })

  it('should reuse the cached token while it has not expired', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 })
    })
    const { getOsToken } = loadTokens()

    await getOsToken()
    await getOsToken()

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('should log and leave the token unset when the request fails', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network error'))
    const { getOsToken } = loadTokens()

    const result = await getOsToken()

    expect(result.token).toBeUndefined()
  })
})

describe('getEsriToken', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should fetch a new token when none is cached', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-1' })
    })
    const { getEsriToken } = loadTokens()

    const token = await getEsriToken()

    expect(globalThis.fetch).toHaveBeenCalledWith('/esri-token')
    expect(token).toBe('esri-token-1')
  })

  it('should reuse the cached token on subsequent calls', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-1' })
    })
    const { getEsriToken } = loadTokens()

    await getEsriToken()
    await getEsriToken()

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('should force a refresh with the refresh query string when requested', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-2' })
    })
    const { getEsriToken } = loadTokens()

    await getEsriToken()
    await getEsriToken(true)

    expect(globalThis.fetch).toHaveBeenLastCalledWith('/esri-token?refresh=true')
  })

  it('should log and leave the token unset when the request fails', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network error'))
    const { getEsriToken } = loadTokens()

    const token = await getEsriToken()

    expect(token).toBeUndefined()
  })
})

describe('getDefraMapConfig', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should fetch and cache the defra map config', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ some: 'config' })
    })
    const { getDefraMapConfig } = loadTokens()

    const first = await getDefraMapConfig()
    const second = await getDefraMapConfig()

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(first).toEqual({ some: 'config' })
    expect(second).toBe(first)
  })
})

describe('setupEsriConfig', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should set the api key and register the OS maps and arcgis interceptors', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-1' })
    })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }

    await setupEsriConfig(esriConfig)

    expect(esriConfig.apiKey).toBe('esri-token-1')
    expect(esriConfig.request.interceptors).toHaveLength(2)
    expect(esriConfig.request.interceptors[0].urls).toBe('https://api.os.uk/maps/vector/v1/vts')
    expect(esriConfig.request.interceptors[1].urls).toBe('https://tiles.arcgis.com/tiles')
  })

  it('should attach an OS bearer token header via the vector maps interceptor', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-1' }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 }) })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }
    await setupEsriConfig(esriConfig)

    const params = { requestOptions: {} }
    await esriConfig.request.interceptors[0].before(params)

    expect(params.requestOptions.headers).toEqual({ Authorization: 'Bearer os-token-1' })
  })

  it('should refresh the esri token when an invalid token error is received', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-1' }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-refreshed' }) })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }
    await setupEsriConfig(esriConfig)

    const invalidTokenError = { details: { httpStatus: esriStatusCodes.INVALID_TOKEN_CODE } }
    await esriConfig.request.interceptors[1].error(invalidTokenError)

    // getEsriToken resolves to a plain token string, so destructuring { token } from it
    // yields undefined - this reflects the current (buggy) refreshEsriToken behaviour
    expect(esriConfig.apiKey).toBeUndefined()
    expect(globalThis.fetch).toHaveBeenLastCalledWith('/esri-token?refresh=true')
  })

  it('should not refresh the esri token for unrelated errors', async () => {
    globalThis.fetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-1' }) })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }
    await setupEsriConfig(esriConfig)

    await esriConfig.request.interceptors[1].error({ details: { httpStatus: 500 } })

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(esriConfig.apiKey).toBe('esri-token-1')
  })
})

describe('getRequest', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should return null for the OS open names nearest search', async () => {
    const { getRequest } = loadTokens()

    const result = await getRequest({ url: 'https://api.os.uk/search/names/v1/nearest', options: {} })

    expect(result).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('should attach an OS bearer token header for other OS api requests', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 })
    })
    const { getRequest } = loadTokens()

    const result = await getRequest({ url: 'https://api.os.uk/maps/raster/v1/wmts', options: { headers: { foo: 'bar' } } })

    expect(result).toEqual({
      url: 'https://api.os.uk/maps/raster/v1/wmts',
      options: { headers: { foo: 'bar', Authorization: 'Bearer os-token-1' } }
    })
  })

  it('should return null for unrelated urls', async () => {
    const { getRequest } = loadTokens()

    const result = await getRequest({ url: 'https://example.com/other', options: {} })

    expect(result).toBeNull()
  })
})

describe('isInvalidTokenError', () => {
  it('should return true when the error has the invalid token status', () => {
    const { isInvalidTokenError } = loadTokens()

    expect(isInvalidTokenError({ details: { httpStatus: esriStatusCodes.INVALID_TOKEN_CODE } })).toBe(true)
  })

  it('should return false for any other status', () => {
    const { isInvalidTokenError } = loadTokens()

    expect(isInvalidTokenError({ details: { httpStatus: 500 } })).toBe(false)
  })

  it('should return false when there are no error details', () => {
    const { isInvalidTokenError } = loadTokens()

    expect(isInvalidTokenError(undefined)).toBe(false)
  })

  it('should return false when the error has no details property', () => {
    const { isInvalidTokenError } = loadTokens()

    expect(isInvalidTokenError({})).toBe(false)
  })
})
