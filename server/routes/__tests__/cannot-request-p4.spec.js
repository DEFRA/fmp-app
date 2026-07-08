const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const constants = require('../../constants')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodZoneByPolygonMock')
const { encodePolygon } = require('../../services/shape-utils')
jest.mock('../../services/agol/getContacts')

const url = constants.routes.CANNOT_REQUEST_P4

describe('cannot-request-p4', () => {
  it('Should show cannot request p4 page with PSO contact details looked up from polygon', async () => {
    const polygon = mockPolygons.optedOut.fz1_only
    const encodedPolygon = encodePolygon(polygon)
    const response = await submitGetRequest({ url: `${url}?encodedPolygon=${encodedPolygon}` })
    document.body.innerHTML = response.payload
    assertCopy('h1', 'You cannot request this flood risk data online')
    assertCopy('#cannot-request-p4-message', 'To order flood risk data for this site, contact the Environment Agency team in Wessex at wessexenquiries@environment-agency.gov.uk')
    assertCopy('a.govuk-link[href^="/results?encodedPolygon="]', 'See a summary of flood risk for your location.')
  })

  it('Should return 400 error when no encoded polygon is provided', async () => {
    const response = await submitGetRequest({ url }, '', 400)
    expect(response.result).toMatchSnapshot()
  })
})
