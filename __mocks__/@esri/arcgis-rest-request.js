let expectedParameters
const response = {
  token: 'TEST_TOKEN',
  refreshToken: () => {
    response.token = 'REFRESHED_TOKEN'
    return response.token
  }
}
const _invalidateToken = () => { response.token = undefined }

const _resetToken = () => { response.token = 'TEST_TOKEN' }

const ApplicationCredentialsManager = {
  fromCredentials: () => (response)
}

const requestSpy = {
  expectParameters: (params) => { expectedParameters = params }
}

const request = async (url, requestObject) => {
  if (expectedParameters) {
    expect(url).toEqual(expectedParameters.url)
    expect(requestObject).toEqual(expectedParameters.requestObject)
  }
  return {
    layers: [
      {
        id: 0,
        count: 0
      }, {
        id: 1,
        count: 0
      }, {
        id: 2,
        count: 0
      }
    ]
  }
}

module.exports = {
  ApplicationCredentialsManager,
  _invalidateToken,
  _resetToken,
  request,
  requestSpy
}
