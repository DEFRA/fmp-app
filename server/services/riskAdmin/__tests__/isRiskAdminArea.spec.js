const { isRiskAdminArea } = require('../isRiskAdminArea')
const { config } = require('../../../../config')

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
    console.log(config)
    const errorToThrow = { message: 'Socket hung up', name: 'ECONNRESET', code: 'ECONNRESET' }
    axios.get.mockRejectedValueOnce(errorToThrow)
    axios.get.mockResolvedValue({ data: { intersects: true } })
    const response = await isRiskAdminArea('[[111,111],[111,112],[112,112],[112,111],[111,111]]')
    expect(response).toEqual({ isRiskAdminArea: true })
  })
})
