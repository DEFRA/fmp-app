let expectedParameters
let queryFeaturesCallCount = 0

const queryFeatureSpy = {
  reset: () => {
    expectedParameters = undefined
    queryFeaturesCallCount = 0
  },
  expectParameters: (params) => { expectedParameters = params },
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
    expect(requestObject).toEqual(expectedParameters)
  }
  return {
    features: 'QUERY_FEATURES_RESPONSE'
  }
}

module.exports = { queryFeatures, queryFeatureSpy, assertQueryFeatureCalls }
