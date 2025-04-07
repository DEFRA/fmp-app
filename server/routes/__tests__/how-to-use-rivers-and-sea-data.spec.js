const {
  submitGetRequest
} = require('../../__test-helpers__/server')
const constants = require('../../constants')
const url = constants.routes.HOW_TO_USE_RIVERS_AND_SEA_DATA

describe('how to use rivers and sea data route', () => {
  it('should match snapshot', async () => {
    const response = await submitGetRequest({ url }, 'How to use rivers and sea data')
    expect(response.result).toMatchSnapshot()
  })
})
