let expectedParameters
let queryFeaturesCallCount = 0
let queryFeatureResponse = 'QUERY_FEATURES_RESPONSE'

const queryFeatureSpy = {
  reset: () => {
    expectedParameters = undefined
    queryFeaturesCallCount = 0
    queryFeatureResponse = 'QUERY_FEATURES_RESPONSE'
  },
  expectParameters: (params) => { expectedParameters = params },
  setMockResponse: (response) => { queryFeatureResponse = response },
  throwOnce: false,
  throwUnexpected: false
}

const assertQueryFeatureCalls = (expectedCallCount) => {
  expect(queryFeaturesCallCount).toEqual(expectedCallCount)
}

const queryFeatures = async (requestObject) => {
  queryFeaturesCallCount++
  if (queryFeatureSpy.throwOnce) {
    queryFeatureSpy.throwOnce = false
    /* eslint-disable no-throw-literal */
    throw ({ response: { error: { code: 498 } } })
  }
  if (queryFeatureSpy.throwUnexpected) {
    queryFeatureSpy.throwUnexpected = false
    throw (new Error('unexpected ERROR'))
  }
  if (expectedParameters) {
    const expectedParams = Array.isArray(expectedParameters) ? expectedParameters[queryFeaturesCallCount - 1] : expectedParameters
    expect(requestObject).toEqual(expectedParams)
  }
  return {
    features: queryFeatureResponse
  }
}

module.exports = { queryFeatures, queryFeatureSpy, assertQueryFeatureCalls }
