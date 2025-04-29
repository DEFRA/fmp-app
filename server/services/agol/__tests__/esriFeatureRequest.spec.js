const { esriFeatureRequest } = require('../esriRequest')
const { requestSpy, assertRequestCalls } = require('@esri/arcgis-rest-request')

const geometry = {
  rings: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]],
  spatialReference: { wkid: 27700 }
}

const params = {
  geometry,
  geometryType: 'esriGeometryPolygon',
  spatialRel: 'esriSpatialRelIntersects',
  returnGeometry: 'false',
  outFields: '*'
}

const expectedParameters = {
  url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endpoint/query',
  requestObject: {
    httpMethod: 'POST',
    authentication: 'TEST_TOKEN',
    params
  }
}

describe('esriFeatureRequest', () => {
  beforeEach(() => {
    requestSpy.reset()
    requestSpy.setMockResponse({ features: 'QUERY_FEATURES_RESPONSE' })
  })

  it('should respond with the mocked object', async () => {
    const response = await esriFeatureRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
  })

  it('should call arcgis-rest-request with the expected object', async () => {
    requestSpy.expectParameters(expectedParameters)
    const response = await esriFeatureRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
    assertRequestCalls(1)
  })

  it('should retry with a refreshed token after an invalid token response', async () => {
    requestSpy.throwOnce = true
    requestSpy.expectParameters({
      ...expectedParameters,
      requestObject: {
        ...expectedParameters.requestObject,
        authentication: 'REFRESHED_TOKEN'
      }
    })

    const response = await esriFeatureRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
    assertRequestCalls(2)
  })

  it('should throw error other than invalid token response', async () => {
    requestSpy.throwUnexpected = true
    try {
      const response = await esriFeatureRequest('/endpoint', geometry, 'esriGeometryPolygon')
      expect(response).toEqual('THIS LINE SHOULD NOT BE REACHED')
    } catch (error) {
      expect(error).toEqual(new Error('unexpected ERROR'))
      assertRequestCalls(1)
    }
  })
})
