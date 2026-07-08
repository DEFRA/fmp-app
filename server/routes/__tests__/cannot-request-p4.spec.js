const { submitGetRequest, getServer } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const constants = require('../../constants')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodZoneByPolygonMock')
const { encodePolygon } = require('../../services/shape-utils')
jest.mock('../../services/agol/getContacts')

const url = constants.routes.CANNOT_REQUEST_P4

describe('cannot-request-p4', () => {
  it('shows cannot request p4 page with PSO contact details looked up from encoded polygon', async () => {
    const polygon = mockPolygons.optedOut.fz1_only
    const encodedPolygon = encodePolygon(polygon)
    const response = await submitGetRequest({ url: `${url}?encodedPolygon=${encodedPolygon}` })
    document.body.innerHTML = response.payload
    assertCopy('h1', 'You cannot request this flood risk data online')
    assertCopy('#cannot-request-p4-message', 'To order flood risk data for this site, contact the Environment Agency team in Wessex at wessexenquiries@environment-agency.gov.uk')
    assertCopy('a.govuk-link[href^="/results?encodedPolygon="]', 'See a summary of flood risk for your location.')
  })

  it('shows cannot request p4 message without team in area text when area name is missing', async () => {
    const polygon = mockPolygons.optedOut.fz1_only
    const encodedPolygon = encodePolygon(polygon)
    const getPsoContactsByPolygonSpy = jest.spyOn(getServer().methods, 'getPsoContactsByPolygon')
      .mockResolvedValueOnce({ EmailAddress: 'wessexenquiries@environment-agency.gov.uk' })

    const response = await submitGetRequest({ url: `${url}?encodedPolygon=${encodedPolygon}` })
    document.body.innerHTML = response.payload
    assertCopy('#cannot-request-p4-message', 'To order flood risk data for this site, contact the Environment Agency at wessexenquiries@environment-agency.gov.uk')

    getPsoContactsByPolygonSpy.mockRestore()
  })

  it('shows fallback national contact when pso email address is missing', async () => {
    const polygon = mockPolygons.optedOut.fz1_only
    const encodedPolygon = encodePolygon(polygon)
    const getPsoContactsByPolygonSpy = jest.spyOn(getServer().methods, 'getPsoContactsByPolygon')
      .mockResolvedValueOnce({ AreaName: 'Wessex' })

    const response = await submitGetRequest({ url: `${url}?encodedPolygon=${encodedPolygon}` })
    document.body.innerHTML = response.payload
    assertCopy('[data-testid="order-product4-email-missing"]', 'We cannot identify the correct Environment Agency team for your location. To order flood risk data for this site, contact the Environment Agency at enquiries@environment-agency.gov.uk')

    getPsoContactsByPolygonSpy.mockRestore()
  })

  it('returns 400 error when no encoded polygon is provided', async () => {
    const response = await submitGetRequest({ url }, '', 400)
    expect(response.result).toMatchSnapshot()
  })
})
