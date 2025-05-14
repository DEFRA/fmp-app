const { getEAMapsToken, invalidateToken } = require('../eaMaps/getEAMapsToken')
const axios = require('axios')
jest.mock('axios')
const expectedToken = 'MY_TEST_TOKEN'

describe('getEAMapsToken', () => {
  it('should call axios.post', async () => {
    axios.post.mockResolvedValue({
      data: {
        token: expectedToken,
        expires: 2747147870038,
        error: undefined
      }
    })

    const token = await getEAMapsToken()
    expect(token).toEqual(expectedToken)
    const tokenAgain = await getEAMapsToken()
    expect(tokenAgain).toEqual(expectedToken)
    expect(axios.post).toHaveBeenCalledTimes(1)
  })

  it('should handle an axios.post error', async () => {
    invalidateToken()
    axios.post.mockResolvedValue({
      data: {
        token: expectedToken,
        expires: 2747147870038,
        error: new Error('TEST_ERROR')
      }
    })
    try {
      const token = await getEAMapsToken()
      expect(token).toEqual('LINE_NOT_REACHED')
    } catch (error) {
      expect(error).toEqual(new Error('An error was returned attempting to get an EA Maps esri token'))
      expect(axios.post).toHaveBeenCalledTimes(1)
    }
  })
})
