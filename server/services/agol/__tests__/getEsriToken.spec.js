const { getEsriToken } = require('../getEsriToken')
const { _invalidateToken, _resetToken, getRefreshTokenCallCount } = require('@esri/arcgis-rest-request')

describe('getEsriToken', () => {
  afterEach(_resetToken)

  it('should return TEST_TOKEN', async () => {
    const { token } = await getEsriToken()
    expect(token).toEqual('TEST_TOKEN')
    expect(getRefreshTokenCallCount()).toEqual(0)
  })

  it('should return REFRESHED_TOKEN after token is invalidated', async () => {
    _invalidateToken()
    const { token } = await getEsriToken()
    expect(token).toEqual('REFRESHED_TOKEN')
    expect(getRefreshTokenCallCount()).toEqual(1)
  })

  it('should return TEST_TOKEN again', async () => {
    const { token } = await getEsriToken()
    expect(token).toEqual('TEST_TOKEN')
  })

  it('refresh token should only be called once after multiple sync requests', async () => {
    _invalidateToken()
    const responses = await Promise.all([getEsriToken(), getEsriToken()])
    expect(responses.length).toEqual(2)
    const [{ token: token1 }, { token: token2 }] = responses
    expect(token1).toEqual('REFRESHED_TOKEN')
    expect(token2).toEqual('REFRESHED_TOKEN')
    expect(getRefreshTokenCallCount()).toEqual(1)
  })
})
