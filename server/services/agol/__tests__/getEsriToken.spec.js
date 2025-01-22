const { getEsriToken } = require('../getEsriToken')
const { _invalidateToken, _resetToken } = require('@esri/arcgis-rest-request')

describe('getEsriToken', () => {
  afterEach(_resetToken)

  it('should return TEST_TOKEN', async () => {
    expect(await getEsriToken()).toEqual('TEST_TOKEN')
  })

  it('should return REFRESHED_TOKEN after token is invalidated', async () => {
    _invalidateToken()
    expect(await getEsriToken()).toEqual('REFRESHED_TOKEN')
  })

  it('should return TEST_TOKEN again', async () => {
    expect(await getEsriToken()).toEqual('TEST_TOKEN')
  })
})
