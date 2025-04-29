const { esriFeatureRequest } = require('../')
const { requestSpy, assertRequestCalls } = require('@esri/arcgis-rest-request')
const { geometry, expectedParameters } = require('../__data__/esriRequestParameters')

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
