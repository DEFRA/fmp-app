describe('getEsriToken', () => {
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

  it('creates and reuses the ArcGIS app manager token state', async () => {
    const refreshTokenMock = jest.fn().mockResolvedValue('esri-token-2')
    const appManager = {
      token: 'esri-token-1',
      refreshToken: refreshTokenMock
    }

    jest.doMock('@esri/arcgis-rest-request', () => ({
      ApplicationCredentialsManager: {
        fromCredentials: jest.fn().mockReturnValue(appManager)
      }
    }))

    const { getEsriToken, _resetCache } = require('./getEsriToken')

    const firstResult = await getEsriToken()
    const secondResult = await getEsriToken()

    expect(firstResult).toEqual({ token: 'esri-token-1', expires: expect.any(Date) })
    expect(secondResult).toEqual({ token: 'esri-token-1', expires: expect.any(Date) })
    expect(refreshTokenMock).not.toHaveBeenCalled()

    _resetCache()
    const refreshedResult = await getEsriToken()

    expect(refreshedResult.token).toBe('esri-token-1')
    expect(refreshTokenMock).not.toHaveBeenCalled()
  })

  it('reuses an in-flight refresh token request', async () => {
    const refreshTokenMock = jest.fn().mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve('esri-token-refreshed'), 10)
    }))
    const appManager = {
      token: 'esri-token-1',
      refreshToken: refreshTokenMock
    }

    jest.doMock('@esri/arcgis-rest-request', () => ({
      ApplicationCredentialsManager: {
        fromCredentials: jest.fn().mockReturnValue(appManager)
      }
    }))

    const { getEsriToken, _resetCache } = require('./getEsriToken')

    const firstResultPromise = getEsriToken(true)
    const secondResultPromise = getEsriToken(true)

    const [firstResult, secondResult] = await Promise.all([firstResultPromise, secondResultPromise])

    expect(firstResult).toEqual({ token: 'esri-token-refreshed', expires: expect.any(Date) })
    expect(secondResult).toEqual({ token: 'esri-token-refreshed', expires: expect.any(Date) })
    expect(refreshTokenMock).toHaveBeenCalledTimes(1)

    _resetCache()
  })

  it('refreshes when a forced refresh is requested', async () => {
    const refreshTokenMock = jest.fn().mockResolvedValue('esri-token-refreshed')
    const appManager = {
      token: 'esri-token-1',
      refreshToken: refreshTokenMock
    }

    jest.doMock('@esri/arcgis-rest-request', () => ({
      ApplicationCredentialsManager: {
        fromCredentials: jest.fn().mockReturnValue(appManager)
      }
    }))

    const { getEsriToken } = require('./getEsriToken')

    const result = await getEsriToken(true)

    expect(result).toEqual({ token: 'esri-token-refreshed', expires: expect.any(Date) })
    expect(refreshTokenMock).toHaveBeenCalledTimes(1)
  })
})
