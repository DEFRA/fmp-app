let expectedParameters
let refreshTokenCallCount = 0
const defaultReponse = { layers: [{ id: 0, count: 0 }, { id: 1, count: 0 }, { id: 2, count: 0 }] }
let requestReponse = defaultReponse
let queryFeaturesCallCount = 0

const refreshToken = async () => {
  refreshTokenCallCount++
  // Short delay to simulate awaiting a response
  await new Promise(resolve => setTimeout(resolve, 100))
  response.token = 'REFRESHED_TOKEN'
  return response.token
}
const response = {
  token: 'TEST_TOKEN',
  refreshToken
}
const _invalidateToken = () => { response.token = undefined }

const _resetToken = () => {
  refreshTokenCallCount = 0
  response.token = 'TEST_TOKEN'
}

const getRefreshTokenCallCount = () => refreshTokenCallCount

const ApplicationCredentialsManager = {
  fromCredentials: () => (response)
}

const assertRequestCalls = (expectedCallCount) => {
  expect(queryFeaturesCallCount).toEqual(expectedCallCount)
}

const requestSpy = {
  expectParameters: (params) => { expectedParameters = params },
  setMockResponse: (response) => { requestReponse = response },
  reset: () => {
    requestReponse = defaultReponse
    queryFeaturesCallCount = 0
  },
  throwOnce: false,
  throwUnexpected: false
}

const request = async (url, requestObject) => {
  queryFeaturesCallCount++
  if (requestSpy.throwOnce) {
    requestSpy.throwOnce = false
    /* eslint-disable no-throw-literal */
    throw ({ response: { error: { code: 498 } } })
  }
  if (requestSpy.throwUnexpected) {
    requestSpy.throwUnexpected = false
    throw (new Error('unexpected ERROR'))
  }

  if (expectedParameters) {
    const expectedParams = Array.isArray(expectedParameters) ? expectedParameters[queryFeaturesCallCount - 1] : expectedParameters
    expect(url).toEqual(expectedParams.url)
    expect(requestObject).toEqual(expectedParams.requestObject)
  }
  return requestReponse
}

module.exports = {
  ApplicationCredentialsManager,
  _invalidateToken,
  _resetToken,
  request,
  requestSpy,
  assertRequestCalls,
  getRefreshTokenCallCount
}
