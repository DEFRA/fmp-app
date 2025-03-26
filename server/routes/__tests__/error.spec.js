const {
  submitGetRequest
} = require('../../__test-helpers__/server')

const constants = require('../../constants')

const url = constants.routes.ERROR

describe('cookies', () => {
  it('Should return error page', async () => {
    const response = await submitGetRequest({ url }, '', 500)
    expect(response.result).toMatchSnapshot()
  })
})
