const { getProductOnePause } = require('../../services/getProductOnePause')
const axios = require('axios')
jest.mock('axios')
const pauseP1URL = 'http://example.com/product-one-config'

describe('getProductOnePause', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => 1764258880000)
  })

  it('should return pauseP1DownloadTo and dateWithinPausePeriod as true when API call is successful', async () => {
    const mockPayload = { pauseP1DownloadFrom: 1764257880000, pauseP1DownloadTo: 1764265080000 }
    axios.get.mockResolvedValueOnce({ data: mockPayload })

    const result = await getProductOnePause(pauseP1URL)
    expect(result).toEqual({ dateWithinPausePeriod: true, pauseP1DownloadTo: '5:38pm on Thursday 27 November 2025' })
    expect(axios.get).toHaveBeenCalledWith(pauseP1URL, { json: true })
  })

  it('should return dateWithinPausePeriod as true if values fall outside of current date/time', async () => {
    Date.now = jest.fn(() => 1764265080000 + 1000) // set current time after pause period
    const mockPayload = { pauseP1DownloadFrom: 1764257880000, pauseP1DownloadTo: null }
    axios.get.mockResolvedValueOnce({ data: mockPayload })

    const result = await getProductOnePause(pauseP1URL)
    expect(result).toEqual({ dateWithinPausePeriod: true, pauseP1DownloadTo: null })
    expect(axios.get).toHaveBeenCalledWith(pauseP1URL, { json: true })
  })

  it('should return dateWithinPausePeriod as false if no pauseP1DownloadFrom value', async () => {
    Date.now = jest.fn(() => 1764265080000 + 1000) // set current time after pause period
    const mockPayload = { pauseP1DownloadFrom: null, pauseP1DownloadTo: null }
    axios.get.mockResolvedValueOnce({ data: mockPayload })

    const result = await getProductOnePause(pauseP1URL)
    expect(result).toEqual({ dateWithinPausePeriod: false, pauseP1DownloadTo: null })
    expect(axios.get).toHaveBeenCalledWith(pauseP1URL, { json: true })
  })

  it('should return dateWithinPausePeriod as false if an empty response is returned', async () => {
    Date.now = jest.fn(() => 1764265080000 + 1000) // set current time after pause period
    const mockPayload = { }
    axios.get.mockResolvedValueOnce({ data: mockPayload })

    const result = await getProductOnePause(pauseP1URL)
    expect(result).toEqual({ dateWithinPausePeriod: false, pauseP1DownloadTo: null })
    expect(axios.get).toHaveBeenCalledWith(pauseP1URL, { json: true })
  })

  it('should return default value of null for pauseP1DownloadTo, dateWithinPausePeriod as false and log an error when when API call fails', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    axios.get.mockRejectedValueOnce(new Error('Network Error'))

    const result = await getProductOnePause(pauseP1URL)
    expect(result).toEqual({ dateWithinPausePeriod: false })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting p1 pause', expect.any(Error))

    consoleSpy.mockRestore()
  })
})
