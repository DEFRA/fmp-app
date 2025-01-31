const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy, weakAssertCopy } = require('../../__test-helpers__/copy')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodDataByPolygonMock')
const { config } = require('../../../config')
jest.mock('../../services/agol/getContacts')

const url = '/results'

const assertFloodZoneCopy = (floodZone) => {
  assertCopy('.govuk-heading-xl', `This location is in flood zone ${floodZone}`)
  weakAssertCopy(`What flood zone ${floodZone} means`)
}

const assertRiskAdminCopy = (expected) => {
  assertCopy(
    '[data-testid="understanding-changed"]',
    expected && 'Our understanding of flood risk from rivers and the sea has changed since this information was published.'
  )
}

const assertOrderFloodRiskDataButton = (expected = true) => {
  assertCopy('[data-testid="order-product4"]', expected && 'Order flood risk data')
  weakAssertCopy('To order flood risk data for this site, contact the Environment Agency team in Wessex at wessexenquiries@environment-agency.gov.uk', !expected)
}

const assertCoreCopy = () => {
  assertCopy('#main-content > div > div > h2', 'Flood risk assessments')
  assertCopy('div.govuk-summary-card__title-wrapper > h2', 'Rivers and the sea')
}

const assertFZ1Copy = (expected = true) => {
  weakAssertCopy('Land within flood zone 1 has a low probability of flooding from rivers and the sea.', expected)
  weakAssertCopy('Your site is in flood zone 1, so it\'s unlikely we\'ll have any flood risk data for it', expected)
}

const assertFZ1lt1haCopy = (expected = true) => {
  weakAssertCopy('Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where:', expected)
  weakAssertCopy('The site you have drawn is 0ha.', expected)
}

const assertFZ1gt1haCopy = (expected = true) => {
  weakAssertCopy('Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).', expected)
  weakAssertCopy('The site you have drawn is 123.43ha.', expected)
}

const assertFZ1gt1AndFZ23Copy = (expected = true) => {
  weakAssertCopy('Based on our flood risk data, you need to carry out a flood risk assessment (FRA)', expected)
}

const assertFZ2Copy = (expected = true) => {
  weakAssertCopy('Land within flood zone 2 has a medium probability of flooding from rivers and the sea.', expected)
}

const assertFZ3Copy = (expected = true) => {
  weakAssertCopy('Land within flood zone 3 has a high probability of flooding from rivers and the sea.', expected)
}

const assertROFRSDefCCCopy = (band, odds, expected = true) => {
  weakAssertCopy('Climate change: projected chance of flooding', expected)
  if (band && odds) {
    weakAssertCopy(`Taking flood defences into account, there could be a ${band}% AEP (${odds}) chance of flooding each year:`, expected)
  }
}

const assertROFRSUnDefCCCopy = (band, odds, expected = true) => {
  weakAssertCopy('Without defences (undefended)', expected)
  weakAssertCopy('We have not modelled the 3.3% AEP event for an undefended scenario', expected)
  if (band && odds) {
    weakAssertCopy(`Without flood defences, there could be a ${band}% AEP (${odds}) chance of flooding each year:`, expected)
  }
}

const assertROFRSDefCopy = (band, odds, expected = true) => {
  weakAssertCopy('Present day chance of flooding', expected)
  weakAssertCopy('<h3 class="govuk-heading-s">With defences (defended)</h3>', expected)
  if (band && odds) {
    weakAssertCopy(`Taking flood defences into account, there could be a ${band}% AEP (${odds}) chance of a flood at this location each year.`, expected)
  }
}

const assertROFRSUnDefCopy = (band, odds, expected = true) => {
  weakAssertCopy('Without defences (undefended)', expected)
  if (band && odds) {
    weakAssertCopy(`Without flood defences, there could be a ${band}% AEP (${odds}) chance of a flood at this location each year.`, expected)
  }
}

const assertSWCopy = (band, odds, expected = true) => {
  weakAssertCopy('Surface water for planning', expected)
  weakAssertCopy('Climate change: projected chance of flooding', expected)
  weakAssertCopy('We do not currently show climate change scenarios for surface water.', expected)
  if (band && odds) {
    weakAssertCopy(`The chance of surface water flooding at this location could be more than ${band}% (${odds}) each year`, expected)
  } else {
    weakAssertCopy('The chance of surface water flooding at this location could be more than', expected)
  }
}

describe('Results Page On Public', () => {
  beforeAll(() => { config.appType = 'public' })
  afterAll(() => { config.appType = 'internal' })

  it('should have correct copy for Zone 1 < 1ha', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertFZ1gt1AndFZ23Copy(false)
    assertFZ1Copy()
    assertFZ1lt1haCopy()
    assertFZ1gt1haCopy(false)
    assertFZ2Copy(false)
    assertFZ3Copy(false)
    assertSWCopy('', '', false)
    assertROFRSDefCCCopy(false, false, false)
    assertROFRSUnDefCCCopy(false, false, false)
    assertROFRSDefCopy(false, false, false)
    assertROFRSUnDefCopy(false, false, false)
    assertCoreCopy()
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
  })

  it('should have correct copy for Zone 1 > 1ha', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_gt_1_ha}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertFZ1gt1AndFZ23Copy()
    assertFZ1Copy()
    assertFZ1lt1haCopy(false)
    assertFZ1gt1haCopy()
    assertFZ2Copy(false)
    assertFZ3Copy(false)
    assertSWCopy('', '', false)
    assertROFRSDefCCCopy(false, false, false)
    assertROFRSUnDefCCCopy(false, false, false)
    assertROFRSDefCopy(false, false, false)
    assertROFRSUnDefCopy(false, false, false)
    assertCoreCopy()
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
  })

  it('Should have correct copy for Zone 2 low risk', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_low}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(2)
    assertCoreCopy()
    assertFZ1gt1AndFZ23Copy()
    assertFZ1Copy(false)
    assertFZ1lt1haCopy(false)
    assertFZ2Copy()
    assertFZ3Copy(false)
    assertSWCopy('0.1', '1 in 1000', true)
    assertROFRSDefCCCopy('0.1', '1 in 1000', true)
    assertROFRSUnDefCCCopy('0.1', '1 in 1000', true)
    assertROFRSDefCopy('0.1', '1 in 1000', true)
    assertROFRSUnDefCopy('0.1', '1 in 1000', true)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
  })

  it('Should have correct copy for Zone 2 medium risk', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_medium}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(2)
    assertCoreCopy()
    assertFZ1gt1AndFZ23Copy()
    assertFZ1Copy(false)
    assertFZ1lt1haCopy(false)
    assertFZ2Copy()
    assertFZ3Copy(false)
    assertSWCopy('', true)
    assertROFRSDefCCCopy('1', '1 in 100', true)
    assertROFRSUnDefCCCopy('1', '1 in 100', true)
    assertROFRSDefCopy('1', '1 in 100', true)
    assertROFRSUnDefCopy('1', '1 in 100', true)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
  })

  it('Should have correct copy for Zone 3 high risk', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz3_high}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(3)
    assertCoreCopy()
    assertFZ1gt1AndFZ23Copy()
    assertFZ1Copy(false)
    assertFZ1lt1haCopy(false)
    assertFZ2Copy(false)
    assertFZ3Copy()
    assertSWCopy('', true)
    assertROFRSDefCCCopy('3.3', '1 in 30', true)
    assertROFRSUnDefCCCopy('1', '1 in 100', true)
    assertROFRSDefCopy('3.3', '1 in 30', true)
    assertROFRSUnDefCopy('1', '1 in 100', true)
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

  it('should not show the "Order flood risk data" for opted out areas in FZ1', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz1_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
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
