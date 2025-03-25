const {
  submitGetRequest
} = require('../../__test-helpers__/server')

describe('healthcheck', () => {
  it('Should get /healthcheck successfully', async () => {
    const response = await submitGetRequest({ url: '/healthcheck' })
    expect(response.result).toMatchSnapshot()
  })
  it('Should get /health-check successfully', async () => {
    const response = await submitGetRequest({ url: '/health-check' })
    expect(response.result).toMatchSnapshot()
  })
})
