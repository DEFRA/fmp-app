const { getOsToken } = require('../os/getOsToken')

const mockExpectedOptions = {
  headers: {
    'Content-Length': 79,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  host: 'api.os.uk',
  method: 'POST',
  path: '/oauth2/token/v1'
}

const expectedHappyResponse = 'TEST DATA RESPONSE'

const mockRequest = {
  on: (onErrorParam, errorCallback) => {
    expect(onErrorParam).toEqual('error')
    return errorCallback
  },
  write: (postData) =>
    expect(postData)
      .toEqual('grant_type=client_credentials&client_id=replace_this&client_secret=replace_this'),
  end: () => {}
}

const mockOnDataHandler = (onParam1, onCallback) => {
  expect(onParam1).toEqual('data')
  return onCallback(expectedHappyResponse)
}

const assertEncoding = (encoding) => { expect(encoding).toEqual('utf8') }
const mockResponseCallbackParameters = {
  on: mockOnDataHandler,
  setEncoding: assertEncoding
}

jest.mock('https', () => ({
  ...jest.requireActual('https'),
  request: (options, mockResponseCallback) => {
    expect(options).toEqual(mockExpectedOptions)
    mockResponseCallback(mockResponseCallbackParameters)
    return mockRequest
  }
}))

describe('getOsToken', () => {
  it('should call https with expected parameters', async () => {
    const response = await getOsToken()
    expect(response).toEqual(expectedHappyResponse)
  })
})
