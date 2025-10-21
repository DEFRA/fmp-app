const {
  submitGetRequest
} = require('../../__test-helpers__/server')
const constants = require('../../constants')
const { encode } = require('@mapbox/polyline')
const url = constants.routes.ORDER_NOT_SUBMITTED
const encodedPolygon = encode([[111,111],[111,112],[112,112],[112,111],[111,111]])

describe('order-not-submitted', () => {
  it('Should return order not submitted when polygon is provided', async () => {
    const response = await submitGetRequest({ url: `${url}?encodedPolygon=${encodedPolygon}` })
    expect(response.result).toMatchSnapshot()
  })
  it('Should return 400 error when no polgyon provided', async () => {
    const response = await submitGetRequest({ url }, '', 400)
    expect(response.result).toMatchSnapshot()
  })
})
