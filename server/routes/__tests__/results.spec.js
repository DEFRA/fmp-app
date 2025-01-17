const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodZonesByPolygonMock')

const url = '/results'

const assertFloodZoneCopy = (floodZone) => {
  const heading = document.querySelector('.govuk-heading-xl')
  expect(heading.textContent).toBe(`This location is in flood zone ${floodZone}`)
}

const assertRiskAdminCopy = (expected) => {
  assertCopy(
    '[data-testid="understanding-changed"]',
    expected && 'Our understanding of flood risk from rivers and the sea has changed'
  )
}

describe('Results Page', () => {
  it('should have the correct copy for Zone 1"', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertRiskAdminCopy(false)
  })

  it('should have the correct copy for Zone 1 with riskAdmin"', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.inRiskAdmin.fz1_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertRiskAdminCopy(true)
  })
})
