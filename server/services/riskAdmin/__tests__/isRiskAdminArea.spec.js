const { isRiskAdminArea } = require('../isRiskAdminArea')
const axios = require('axios')
jest.mock('axios')

describe('isRiskAdminArea', () => {
  it('should return true when riskadmin-api returns true', async () => {
    axios.get.mockResolvedValue({ data: { intersects: true } })
    const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
    expect(response).toEqual({ isRiskAdminArea: true })
  })

  it('should return false when riskadmin-api returns a false response', async () => {
    axios.get.mockResolvedValue({ data: { intersects: false } })
    const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
    expect(response).toEqual({ isRiskAdminArea: false })
  })
})

describe('isRiskAdminArea - Error Handling', () => {
  let logSpy
  const expectedUrl = 'http://riskadmin-api-url/hit-test?polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]'
  const expectedError = 'Error requesting riskadmin-api data:\n'
  beforeEach(async () => {
    delete process.env.forceRiskAdminApiResponse
    logSpy = jest.spyOn(console, 'log')
  })

  it('should return true if process.env.forceRiskAdminApiResponse === true', async () => {
    process.env.forceRiskAdminApiResponse = 'true'
    const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
    expect(response).toEqual({ isRiskAdminArea: true })
  })

  it('should return false if process.env.forceRiskAdminApiResponse === false', async () => {
    process.env.forceRiskAdminApiResponse = 'false'
    const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
    expect(response).toEqual({ isRiskAdminArea: false })
  })

  it('should log and throw an Axios Type error ', async () => {
    const errorToThrow = { message: 'Mocked Error', name: 'BAD_REQUEST', code: 12345 }
    const expectedLoggedErrorObject = Object.assign({}, { url: expectedUrl }, errorToThrow)
    axios.get.mockRejectedValue(errorToThrow)
    try {
      const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
      expect(response).toEqual('this line should not be reached')
    } catch (error) {
      expect(error).toEqual(errorToThrow)
      expect(logSpy).toHaveBeenCalledWith(expectedError, JSON.stringify(expectedLoggedErrorObject))
    }
  })

  it('should log and throw an error if response is not an array ', async () => {
    axios.get.mockResolvedValue({ data: 'NOT JSON: {intersects: ?}' })
    const errorToThrow = { message: 'Unexpected response from riskadmin-api', name: 'Error' }
    const expectedLoggedErrorObject = Object.assign({}, { url: expectedUrl }, errorToThrow)
    try {
      const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
      expect(response).toEqual('this line should not be reached')
    } catch (error) {
      expect(error).toEqual(new Error('Unexpected response from riskadmin-api'))
      expect(logSpy).toHaveBeenNthCalledWith(1, 'riskadmin-api response data:\n', 'NOT JSON: {intersects: ?}')
      expect(logSpy).toHaveBeenNthCalledWith(2, expectedError, JSON.stringify(expectedLoggedErrorObject))
    }
  })

  it('should log and throw any other error type ', async () => {
    const errorToThrow = 'Some Error'
    axios.get.mockRejectedValue(errorToThrow)
    try {
      const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
      expect(response).toEqual('this line should not be reached')
    } catch (error) {
      expect(error).toEqual(errorToThrow)
      expect(logSpy).toHaveBeenCalledWith(expectedError, expectedUrl, errorToThrow)
    }
  })

  it('should retry if an ECONNRESET response is received', async () => {
    const errorToThrow = { message: 'Socket hung up', name: 'ECONNRESET', code: 'ECONNRESET' }
    axios.get.mockRejectedValueOnce(errorToThrow)
    axios.get.mockResolvedValue({ data: { intersects: true } })
    const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
    expect(response).toEqual({ isRiskAdminArea: true })
  })
})

describe('isRiskAdminArea - protocol specific agents', () => {
  const polygon = '[[111,111],[111,112],[112,112],[112,111],[111,111]]'
  beforeEach(() => {
    jest.resetModules()
    delete process.env.forceRiskAdminApiResponse
  })

  it('should use an http keep-alive agent when riskAdminApiUrl is http', async () => {
    jest.doMock('../../../../config', () => ({
      config: {
        riskAdminApi: {
          url: 'http://riskadmin-api-url'
        }
      }
    }))
    const http = require('http')
    const axiosMock = require('axios')
    axiosMock.get.mockResolvedValue({ data: { intersects: true } })
    const { isRiskAdminArea } = require('../isRiskAdminArea')
    await isRiskAdminArea(polygon)
    expect(axiosMock.get).toHaveBeenCalledWith(
      `http://riskadmin-api-url/hit-test?polygon=${polygon}`,
      expect.objectContaining({
        httpAgent: expect.any(http.Agent),
        httpsAgent: undefined
      })
    )
  })

  it('should use an https keep-alive agent when riskAdminApiUrl is https', async () => {
    jest.doMock('../../../../config', () => ({
      config: {
        riskAdminApi: {
          url: 'https://riskadmin-api-url'
        }
      }
    }))
    const https = require('https')
    const axiosMock = require('axios')
    axiosMock.get.mockResolvedValue({ data: { intersects: true } })
    axiosMock.get.mockResolvedValue({ data: { intersects: true } })
    const { isRiskAdminArea } = require('../isRiskAdminArea')
    await isRiskAdminArea(polygon)
    expect(axiosMock.get).toHaveBeenCalledWith(
      `https://riskadmin-api-url/hit-test?polygon=${polygon}`,
      expect.objectContaining({
        httpAgent: undefined,
        httpsAgent: expect.any(https.Agent)
      })
    )
  })
})
