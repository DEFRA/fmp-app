const {
  submitGetRequest
} = require('../../__test-helpers__/server')
const constants = require('../../constants')

const url = constants.routes.TERMS_AND_CONDITIONS

describe('terms-and-conditions', () => {
  it('Should return terms-and-conditions page', async () => {
    const response = await submitGetRequest({ url })
    expect(response.result).toMatchSnapshot()
  })
})
