const {
  submitGetRequest
} = require('../../__test-helpers__/server')

const constants = require('../../constants')

const url = constants.routes.ERROR

describe('error page', () => {
  it('Should return error page', async () => {
    const response = await submitGetRequest({ url }, '', 500)
    expect(response.result).toMatchSnapshot()
  })

  it('Should return 404 page for unknown route', async () => {
    const response = await submitGetRequest({ url: '/unknown-route-for-404-test' }, '', 404)
    expect(response.result).toBeDefined()
  })
})
