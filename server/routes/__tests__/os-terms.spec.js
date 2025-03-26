const {
  submitGetRequest
} = require('../../__test-helpers__/server')
const constants = require('../../constants')

const url = constants.routes.OS_TERMS

describe('os-terms', () => {
  it('Should return os-terms page', async () => {
    const response = await submitGetRequest({ url })
    expect(response.result).toMatchSnapshot()
  })
})
