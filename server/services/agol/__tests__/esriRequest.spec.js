const { esriRequest, esriRequestByIntersectArea } = require('../esriRequest')
const { queryFeatureSpy, assertQueryFeatureCalls } = require('@esri/arcgis-rest-feature-service')
const { _resetToken } = require('@esri/arcgis-rest-request')
const gainsboroughCustomerQueryResults = require('./__data__/gainsboroughCustomerQueryResults.json')

const geometry = {
  rings: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]],
  spatialReference: { wkid: 27700 }
}

const expectedParameters = {
  url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endpoint',
  geometry,
  geometryType: 'esriGeometryPolygon',
  spatialRel: 'esriSpatialRelIntersects',
  returnGeometry: 'false',
  authentication: 'TEST_TOKEN',
  outFields: '*'
}

describe('esriRequest', () => {
  beforeEach(() => {
    queryFeatureSpy.reset()
  })

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

describe('esriRequestByIntersectArea', () => {
  beforeEach(() => {
    queryFeatureSpy.reset()
    _resetToken()
  })

  it('should call queryFeatures with the expected object', async () => {
    // First test that esriRequestByIntersectArea functions exactly the same as esriRequest when a single reult is returned
    queryFeatureSpy.expectParameters(expectedParameters)
    const response = await esriRequestByIntersectArea('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
    assertQueryFeatureCalls(1)
  })

  it('should call queryFeatures twice when the results are an array with length > 1', async () => {
    // First test that esriRequestByIntersectArea functions exactly the same as esriRequest when a single reult is returned
    const gainsboroughGeometry = {
      rings: [[
        [481414, 391579],
        [483358, 391583],
        [483347, 390644],
        [481418, 390637],
        [481414, 391579]
      ]],
      spatialReference: { wkid: 27700 }
    }
    queryFeatureSpy.setMockResponse(gainsboroughCustomerQueryResults)
    queryFeatureSpy.expectParameters([
      { ...expectedParameters, geometry: gainsboroughGeometry, returnGeometry: 'false' },
      { ...expectedParameters, geometry: gainsboroughGeometry, returnGeometry: 'true' }
    ])
    const response = await esriRequestByIntersectArea('/endpoint', gainsboroughGeometry, 'esriGeometryPolygon')
    console.log(response)
    expect(response).toEqual([
      { ...gainsboroughCustomerQueryResults[1], area: 1672930043496160 },
      { ...gainsboroughCustomerQueryResults[0], area: 583132364260349.9 }
    ])
    assertQueryFeatureCalls(2)
  })
})
