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
