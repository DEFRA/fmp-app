const {
  submitGetRequest
} = require('../../__test-helpers__/server')

const constants = require('../../constants')

const url = constants.routes.ACCESSIBILITY_STATEMENT

describe('cookies', () => {
  it('Should return accessibility statement page', async () => {
    const response = await submitGetRequest({ url })
    expect(response.result).toMatchSnapshot()
  })
})
