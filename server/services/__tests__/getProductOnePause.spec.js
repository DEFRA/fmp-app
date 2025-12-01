const { getProductOnePause } = require('../../services/getProductOnePause')
const axios = require('axios')
jest.mock('axios')

describe('getProductOnePause', () => {
  const pauseP1URL = 'http://example.com/product-one-config'

  it('should return payload when API call is successful', async () => {
    const mockPayload = { data: { pauseP1DownloadFrom: '2024-01-01T00:00:00Z', pauseP1DownloadTo: '2024-01-10T00:00:00Z' } }
    axios.get.mockResolvedValueOnce({ data: mockPayload })

    const result = await getProductOnePause(pauseP1URL)
    expect(result).toEqual(mockPayload)
    expect(axios.get).toHaveBeenCalledWith(pauseP1URL, { json: true })
  })

  it('should return default values and log error when API call fails', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    axios.get.mockRejectedValueOnce(new Error('Network Error'))

    const result = await getProductOnePause(pauseP1URL)
    expect(result).toEqual({ pauseP1DownloadFrom: null, pauseP1DownloadTo: null })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting p1 pause', expect.any(Error))

    consoleSpy.mockRestore()
  })
})
