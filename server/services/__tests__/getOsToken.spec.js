const { getOsToken } = require('../os/getOsToken')
const https = require('https')
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
jest.mock('https', () => ({
  ...jest.requireActual('https'),
  request: jest.fn()
}))

describe('getOsToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call https with expected parameters and complete request', async () => {
    const mockOnDataHandler = (onParam1, onCallback) => {
      expect(onParam1).toEqual('data')
      return onCallback(expectedHappyResponse)
    }
    const assertEncoding = (encoding) => { expect(encoding).toEqual('utf8') }
    const mockResponseCallbackParameters = {
      on: mockOnDataHandler,
      setEncoding: assertEncoding
    }
    const endFn = jest.fn()
    const mockRequest = {
      on: jest.fn(),
      write: jest.fn(),
      end: endFn
    }
    https.request.mockImplementation((options, mockResponseCallback) => {
      expect(options).toEqual(mockExpectedOptions)
      mockResponseCallback(mockResponseCallbackParameters)
      return mockRequest
    })
    const response = await getOsToken()
    expect(response).toEqual(expectedHappyResponse)
    // Check that request methods were called
    expect(mockRequest.on).toHaveBeenCalledWith('error', expect.any(Function))
    expect(mockRequest.write).toHaveBeenCalledWith(expect.stringContaining('grant_type=client_credentials'))
    expect(mockRequest.end).toHaveBeenCalled()
  })

  it('should reject when https request emits an error', async () => {
    const expectedError = new Error('request failed')
    const mockRequest = {
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          callback(expectedError)
        }
      }),
      write: jest.fn(),
      end: jest.fn()
    }
    https.request.mockImplementation((options) => {
      expect(options).toEqual(mockExpectedOptions)
      return mockRequest
    })
    await expect(getOsToken()).rejects.toEqual(expectedError)
    expect(mockRequest.on).toHaveBeenCalledWith('error', expect.any(Function))
  })
})
