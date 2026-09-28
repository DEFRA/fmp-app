describe('getOsToken', () => {
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
      OS_TOKEN_URL: 'https://api.os.uk/oauth2/token/v1'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('fetches a token once and reuses the cached value while valid', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'os-token-1',
        expires_in: 300
      })
    })
    global.fetch = fetchMock

    const { getOsToken, _resetCache } = require('./getOsToken')

    const firstToken = await getOsToken()
    const secondToken = await getOsToken()

    expect(firstToken).toEqual({ access_token: 'os-token-1', expires_in: 300 })
    expect(secondToken).toEqual({ access_token: 'os-token-1', expires_in: 300 })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    _resetCache()
    const refreshedToken = await getOsToken()

    expect(refreshedToken).toEqual({ access_token: 'os-token-1', expires_in: 300 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws when the OS token request fails', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: jest.fn().mockResolvedValue('bad credentials')
    })
    global.fetch = fetchMock

    const { getOsToken } = require('./getOsToken')

    await expect(getOsToken()).rejects.toThrow('OS token request failed with 401: bad credentials')
  })
})
