const {
  submitGetRequest
} = require('../../__test-helpers__/server')

describe('maintenance', () => {
  it('Should get /maintenance successfully', async () => {
    const response = await submitGetRequest({ url: '/maintenance' })
    expect(response.result).toMatchSnapshot()
  })
  it('Should get /maintainence successfully', async () => {
    const response = await submitGetRequest({ url: '/maintainence' })
    expect(response.result).toMatchSnapshot()
  })
})
