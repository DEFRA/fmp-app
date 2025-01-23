const { esriRequest } = require('../esriRequest')
const { queryFeatureSpy } = require('@esri/arcgis-rest-feature-service')

const geometry = {
  rings: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]],
  spatialReference: { wkid: 27700 }
}

describe('esriRequest', () => {
  it('should respond with the mocked object', async () => {
    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
  })

  it('should call queryFeatures with the expected object', async () => {
    queryFeatureSpy.expectParameters({
      url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endpoint',
      geometry,
      geometryType: 'esriGeometryPolygon',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      authentication: 'TEST_TOKEN',
      outFields: '*'
    })
    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
  })
})
