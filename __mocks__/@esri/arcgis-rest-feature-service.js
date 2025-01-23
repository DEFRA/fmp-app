let expectedParameters
const queryFeatureSpy = {
  expectParameters: (params) => { expectedParameters = params }
}

const queryFeatures = async (requestObject) => {
  if (expectedParameters) {
    expect(requestObject).toEqual(expectedParameters)
  }
  return {
    features: 'QUERY_FEATURES_RESPONSE'
  }
}

module.exports = { queryFeatures, queryFeatureSpy }
