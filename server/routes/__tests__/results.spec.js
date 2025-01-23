const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodZonesByPolygonMock')
const { config } = require('../../../config')
jest.mock('../../services/agol/getContacts')

const url = '/results'

const assertFloodZoneCopy = (floodZone) => {
  const heading = document.querySelector('.govuk-heading-xl')
  expect(heading.textContent).toBe(`This location is in flood zone ${floodZone}`)
}

const assertRiskAdminCopy = (expected) => {
  assertCopy(
    '[data-testid="understanding-changed"]',
    expected && 'Our understanding of flood risk from rivers and the sea has changed since this information was published.'
  )
}

const assertOrderFloodRiskDataButton = (expected = true) => {
  assertCopy('[data-testid="order-product4"]', expected && 'Order flood risk data')
}

describe('Results Page On Public', () => {
  beforeAll(() => { config.appType = 'public' })
  afterAll(() => { config.appType = 'internal' })
  it('should have the correct copy for Zone 1"', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
  })

  it('should have the correct copy for Zone 1 with riskAdmin"', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.inRiskAdmin.fz1_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertRiskAdminCopy(true)
    assertOrderFloodRiskDataButton()
  })

  it('should not show the "Order flood risk data" for opted out areas', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(3)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton(false)
  })
})

describe('Results Page On Internal', () => {
  beforeAll(() => { config.appType = 'internal' })
  it('should show the "Order flood risk data" for opted out areas on internal', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(3)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton(true)
  })
})
