const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const constants = require('../../constants')
const { encode } = require('@mapbox/polyline')

const url = constants.routes.CANNOT_REQUEST_P4
const encodedPolygon = encode([[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]])

describe('cannot-request-p4', () => {
  it('Should show cannot request p4 page when encoded polygon is provided', async () => {
    const areaName = 'Yorkshire'
    const psoEmailAddress = 'neyorkshire@environment-agency.gov.uk'
    const query = new URLSearchParams({ encodedPolygon, areaName, psoEmailAddress }).toString()
    const response = await submitGetRequest({ url: `${url}?${query}` })
    document.body.innerHTML = response.payload
    assertCopy('h1', 'You cannot request this flood risk data online')
    assertCopy('#cannot-request-p4-message', `To order flood risk data for this site, contact the Environment Agency team in ${areaName} at ${psoEmailAddress}`)
    assertCopy('a.govuk-link[href^="/results?encodedPolygon="]', 'See a summary of flood risk for your location.')
  })

  it('Should use default empty values when areaName and psoEmailAddress are not provided', async () => {
    const response = await submitGetRequest({ url: `${url}?encodedPolygon=${encodedPolygon}` })
    document.body.innerHTML = response.payload
    assertCopy('[data-testid="order-product4-email-missing"]', 'We cannot identify the correct Environment Agency team for your location.')
    assertCopy('[data-testid="order-product4-email-missing"]', 'To order flood risk data for this site, contact the Environment Agency at enquiries@environment-agency.gov.uk')
  })

  it('Should return 400 error when no encoded polygon is provided', async () => {
    const response = await submitGetRequest({ url }, '', 400)
    expect(response.result).toMatchSnapshot()
  })
})
