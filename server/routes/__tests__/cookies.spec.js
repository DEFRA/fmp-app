const {
  submitGetRequest
} = require('../../__test-helpers__/server')
const constants = require('../../constants')

const url = constants.routes.COOKIES

describe('cookies', () => {
  it('Should return cookies page successfully with cookies rejected by default', async () => {
    const response = await submitGetRequest({ url }, 'Cookies')
    expect(response.result).toMatchSnapshot()
  })
  it('Should return cookies page successfully with cookies accepted option selected', async () => {
    const response = await submitGetRequest({ url, headers: { Cookie: 'GA=Accept' } }, 'Cookies')
    expect(response.result).toMatchSnapshot()
  })
  it('Should return cookies page successfully with cookies rejected option selected', async () => {
    const response = await submitGetRequest({ url, headers: { Cookie: 'GA=Reject' } }, 'Cookies')
    expect(response.result).toMatchSnapshot()
  })
})
