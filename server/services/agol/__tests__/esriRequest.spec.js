const { esriRequest } = require('../esriRequest')
const { queryFeatureSpy, assertQueryFeatureCalls } = require('@esri/arcgis-rest-feature-service')

const geometry = {
  rings: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]],
  spatialReference: { wkid: 27700 }
}

describe('esriRequest', () => {
  beforeEach(() => {
    queryFeatureSpy.reset()
  })

  const expectedParameters = {
    url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endpoint',
    geometry,
    geometryType: 'esriGeometryPolygon',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    authentication: 'TEST_TOKEN',
    outFields: '*'
  }

  it('should respond with the mocked object', async () => {
    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
  })

  it('should call queryFeatures with the expected object', async () => {
    queryFeatureSpy.expectParameters(expectedParameters)
    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
    assertQueryFeatureCalls(1)
  })

  it('should retry with a refreshed token after an invalid token response', async () => {
    queryFeatureSpy.throwOnce = true
    queryFeatureSpy.expectParameters(Object.assign({}, expectedParameters, { authentication: 'REFRESHED_TOKEN' }))
    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
    assertQueryFeatureCalls(2)
  })

  it('should throw error other than invalid token response', async () => {
    queryFeatureSpy.throwUnexpected = true
    try {
      const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
      expect(response).toEqual('THIS LINE SHOULD NOT BE REACHED')
    } catch (error) {
      expect(error).toEqual(new Error('unexpected ERROR'))
      assertQueryFeatureCalls(1)
    }
  })
})
