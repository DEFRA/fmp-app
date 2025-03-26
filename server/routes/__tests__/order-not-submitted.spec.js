const {
  submitGetRequest
} = require('../../__test-helpers__/server')
const constants = require('../../constants')

const url = constants.routes.ORDER_NOT_SUBMITTED

describe('order-not-submitted', () => {
  it('Should return order not submitted when polygon is provided', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]` })
    expect(response.result).toMatchSnapshot()
  })
  it('Should return 400 error when no polgyon provided', async () => {
    const response = await submitGetRequest({ url }, '', 400)
    expect(response.result).toMatchSnapshot()
  })
})
