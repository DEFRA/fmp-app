const { esriRequest, esriRequestByIntersectArea } = require('../esriRequest')
const { _resetToken, requestSpy, assertRequestCalls } = require('@esri/arcgis-rest-request')
const gainsboroughCustomerQueryResults = require('./__data__/gainsboroughCustomerQueryResults.json')
const misformedCustomerQueryResults = require('./__data__/misformedCustomerQueryResults.json')

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

describe('esriRequest', () => {
  beforeEach(() => {
    requestSpy.reset()
    requestSpy.setMockResponse({ features: 'QUERY_FEATURES_RESPONSE' })
  })

  it('should respond with the mocked object', async () => {
    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
  })

  it('should call arcgis-rest-request with the expected object', async () => {
    requestSpy.expectParameters(expectedParameters)
    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
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

    const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
    expect(response).toEqual('QUERY_FEATURES_RESPONSE')
    assertRequestCalls(2)
  })

  it('should throw error other than invalid token response', async () => {
    requestSpy.throwUnexpected = true
    try {
      const response = await esriRequest('/endpoint', geometry, 'esriGeometryPolygon')
      expect(response).toEqual('THIS LINE SHOULD NOT BE REACHED')
    } catch (error) {
      expect(error).toEqual(new Error('unexpected ERROR'))
      assertRequestCalls(1)
    }
  })
})

describe('esriRequestByIntersectArea', () => {
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
    // First test that esriRequestByIntersectArea functions exactly the same as esriRequest when a single result is returned
    requestSpy.expectParameters(expectedParameters)
    const response = await esriRequestByIntersectArea('/endpoint', geometry, 'esriGeometryPolygon')
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
      ...expectedParameters.requestObject, params: { ...params, geometry: gainsboroughGeometry, returnGeometry: 'true' }
    }
  }

  it('should call arcgis-rest-request twice when the results are an array with length > 1', async () => {
    // test that esriRequestByIntersectArea functions sorts the data when a larger intersection is 2nd
    requestSpy.setMockResponse({ features: gainsboroughCustomerQueryResults })
    requestSpy.expectParameters([expectedParameters1, expectedParameters2])

    const response = await esriRequestByIntersectArea('/endpoint', gainsboroughGeometry, 'esriGeometryPolygon')
    expect(response).toEqual([
      { ...gainsboroughCustomerQueryResults[1], area: 1672930043496160 },
      { ...gainsboroughCustomerQueryResults[0], area: 583132364260349.9 }
    ])
    assertRequestCalls(2)
  })

  it('should cope with invalid data', async () => {
    // test that esriRequestByIntersectArea works when the data is not suitable for the turf library
    // - this is an edge case, but ensures that the service works as before if any errors occur in the
    // area sort code
    requestSpy.setMockResponse({ features: misformedCustomerQueryResults })
    requestSpy.expectParameters([expectedParameters1, expectedParameters2])
    const response = await esriRequestByIntersectArea('/endpoint', gainsboroughGeometry, 'esriGeometryPolygon')
    expect(response).toEqual([
      { ...misformedCustomerQueryResults[0], area: 0 },
      { ...misformedCustomerQueryResults[1], area: 0 }
    ])
    assertRequestCalls(2)
  })
})
