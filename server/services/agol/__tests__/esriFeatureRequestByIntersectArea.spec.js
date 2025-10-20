const { esriFeatureRequestByIntersectArea } = require('../')
const { _resetToken, requestSpy, assertRequestCalls } = require('@esri/arcgis-rest-request')
const gainsboroughCustomerQueryResults = require('../__data__/gainsboroughCustomerQueryResults.json')
const misformedCustomerQueryResults = require('../__data__/misformedCustomerQueryResults.json')
const { geometry, params, expectedParameters } = require('../__data__/esriRequestParameters')

describe('esriFeatureRequestByIntersectArea', () => {
  const gainsboroughGeometry = {
    rings: [[[481414, 391579], [483358, 391583], [483347, 390644], [481418, 390637], [481414, 391579]]],
    spatialReference: { wkid: 27700 }
  }
  beforeEach(() => {
    requestSpy.reset()
    requestSpy.setMockResponse({ features: 'QUERY_FEATURES_RESPONSE' })
    _resetToken()
  })

  it('should call queryFeatures with the expected object', async () => {
    // First test that esriFeatureRequestByIntersectArea functions exactly the same as esriFeatureRequest when a single result is returned
    requestSpy.expectParameters(expectedParameters)
    const response = await esriFeatureRequestByIntersectArea('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
    assertRequestCalls(1)
  })

  const expectedParameters1 = {
    ...expectedParameters,
    requestObject: {
      ...expectedParameters.requestObject, params: { ...params, geometry: gainsboroughGeometry }
    }
  }
  const expectedParameters2 = {
    ...expectedParameters,
    requestObject: {
      ...expectedParameters.requestObject, params: { ...params, geometry: gainsboroughGeometry, returnGeometry: 'true', maxAllowableOffset: 100 }
    }
  }

  it('should call arcgis-rest-request twice when the results are an array with length > 1', async () => {
    // test that esriFeatureRequestByIntersectArea functions sorts the data when a larger intersection is 2nd
    requestSpy.setMockResponse({ features: gainsboroughCustomerQueryResults })
    requestSpy.expectParameters([expectedParameters1, expectedParameters2])

    const response = await esriFeatureRequestByIntersectArea('/endpoint', gainsboroughGeometry, 'esriGeometryPolygon')
    expect(response).toEqual([
      { ...gainsboroughCustomerQueryResults[1], area: 1669192802899591.5 },
      { ...gainsboroughCustomerQueryResults[0], area: 581829676228820.5 }
    ])
    assertRequestCalls(2)
  })

  it('should cope with invalid data', async () => {
    // test that esriFeatureRequestByIntersectArea works when the data is not suitable for the turf library
    // - this is an edge case, but ensures that the service works as before if any errors occur in the
    // area sort code
    requestSpy.setMockResponse({ features: misformedCustomerQueryResults })
    requestSpy.expectParameters([expectedParameters1, expectedParameters2])
    const response = await esriFeatureRequestByIntersectArea('/endpoint', gainsboroughGeometry, 'esriGeometryPolygon')
    expect(response).toEqual([
      { ...misformedCustomerQueryResults[0], area: 0 },
      { ...misformedCustomerQueryResults[1], area: 0 }
    ])
    assertRequestCalls(2)
  })
})
