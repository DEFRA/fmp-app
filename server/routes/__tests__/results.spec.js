const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodDataByPolygonMock')
const { config } = require('../../../config')
jest.mock('../../services/agol/getContacts')

const url = '/results'

const assertFloodZoneCopy = (floodZone) => {
  assertCopy('.govuk-heading-xl', `This location is in flood zone ${floodZone}`)
  assertCopy('[data-testid="fz-description"', `What flood zone ${floodZone} means`)
}

const assertRiskAdminCopy = (expected) => {
  assertCopy(
    '[data-testid="understanding-changed"]',
    expected && 'Our understanding of flood risk from rivers and the sea has changed since this information was published.'
  )
}

const assertOrderFloodRiskDataButton = (expected = true) => {
  assertCopy('[data-testid="order-product4"]', expected && 'Order flood risk data')
  // Below email contact is hidden if the button is visible
  assertCopy('[data-testid="order-product4-email"]', !expected && 'To order flood risk data for this site, contact the Environment Agency team in Wessex at wessexenquiries@environment-agency.gov.uk')
}

const assertCoreCopy = () => {
  assertCopy('#main-content > div > div > h2', 'Flood risk assessments')
  assertCopy('div.govuk-summary-card__title-wrapper > h2', 'Rivers and the sea')
}

const assertFZ1Copy = (expected = true) => {
  assertCopy('[data-testid="fz1-probability"]', expected && 'Land within flood zone 1 has a low probability of flooding from rivers and the sea.')
  assertCopy('[data-testid="fz1-order-product4"]', expected && 'Your site is in flood zone 1, so it\'s unlikely we\'ll have any flood risk data for it')
}

const assertFZ1lt1haCopy = (expected = true) => {
  assertCopy('[data-testid="fz1-lt1ha-fra"]', expected && 'Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where:')
  assertCopy('[data-testid="fz1-lt1ha-area"]', expected && 'The site you have drawn is 0ha.')
}

const assertFZ1gt1haCopy = (expected = true) => {
  assertCopy('[data-testid="fz1-gt1ha-fra"]', expected && 'Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).')
}

const assertFZ1gt1haOrfz1lt1haFRA = (expected = true) => {
  assertCopy('[data-testid="fz1-gt1ha-area-or-lt1haFRA"]', expected && 'The site you have drawn is 123.43ha.')
}

const assertFZ1lt1haFRA = (expected = true) => {
  assertCopy('[data-testid="fz1-gt1ha-area-or-lt1haFRA"]', expected && 'The site you have drawn is 0ha.')
}

const assertFraCopy = (expected = true) => {
  assertCopy('[data-testid="fra"]', expected && 'Based on our flood risk data, you need to carry out a flood risk assessment (FRA)')
}

const assertFZ2Copy = (expected = true) => {
  assertCopy('[data-testid="fz2-probability"]', expected && 'Land within flood zone 2 has a medium probability of flooding from rivers and the sea.')
  assertCopy('[data-testid="fz2-probability"] + p', expected && 'You need to carry out a flood risk assessment (FRA) as part of the planning application for this development.')
}

const assertFZ3Copy = (expected = true) => {
  assertCopy('[data-testid="fz3-probability"]', expected && 'Land within flood zone 3 has a high probability of flooding from rivers and the sea.')
  assertCopy('[data-testid="fz3-probability"] + p', expected && 'You need to carry out a flood risk assessment (FRA) as part of the planning application for this development.')
}

const assertROFRSDefCCCopy = (band, odds, expected = true) => {
  assertCopy('[data-testid="rofrs-cc"]', expected && 'Climate change: projected chance of flooding')
  assertCopy('[data-testid="rofrs-cc-defended-probability"]', expected && `Taking flood defences into account, there could be a ${band}% AEP (${odds}) chance of flooding each year:`)
}

const assertROFRSUnDefCCCopy = (band, odds, expected = true) => {
  assertCopy('[data-testid="rofrs-cc-undefended"]', expected && 'Without defences (undefended)')
  assertCopy('[data-testid="rofrs-cc-undefended"] + p', expected && 'We have not modelled the 3.3% AEP event for an undefended scenario')
  assertCopy('[data-testid="rofrs-cc-undefended"] + p + p', expected && `Without flood defences, there could be a ${band}% AEP (${odds}) chance of flooding each year:`)
}

const assertROFRSDefCopy = (band, odds, expected = true) => {
  assertCopy('[data-testid="rofrs"] > dt', expected && 'Present day chance of flooding')
  assertCopy('[data-testid="rofrs-defended"]', expected && 'With defences (defended)')
  assertCopy('[data-testid="rofrs-defended"] + p', expected && `Taking flood defences into account, there could be a ${band}% AEP (${odds}) chance of a flood at this location each year.`)
}

const assertROFRSUnDefCopy = (band, odds, expected = true) => {
  assertCopy('[data-testid="rofrs-undefended"]', expected && 'Without defences (undefended)')
  assertCopy('[data-testid="rofrs-undefended"] + p', expected && `Without flood defences, there could be a ${band}% AEP (${odds}) chance of a flood at this location each year.`)
}

const assertSWCopy = (band, odds, expected = true) => {
  assertCopy('[data-testid="sw"] > div > h2', expected && 'Surface water for planning')
  assertCopy('[data-testid="sw"] > div > dl > div > dt', expected && 'Climate change: projected chance of flooding')
  assertCopy('[data-testid="sw"] > div > dl > div > dd > p:nth-child(1)', expected && 'We do not currently show climate change scenarios for surface water.')
  assertCopy('[data-testid="sw-probability"]', expected && `The chance of surface water flooding at this location could be more than ${band}% (${odds}) each year`)
}
const assertCCAllowancesLink = (expected = true) => {
  assertCopy('[data-testid="cc-allowances"]', expected && 'Find out more about climate change allowances.')
}

describe('Results Page On Public', () => {
  beforeAll(() => { config.appType = 'public' })
  afterAll(() => { config.appType = 'internal' })

  it('should have correct copy for Zone 1 < 1ha', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertFraCopy(false)
    assertFZ1Copy()
    assertFZ1lt1haCopy()
    assertFZ1gt1haCopy(false)
    assertFZ1gt1haOrfz1lt1haFRA(false)
    assertFZ1lt1haFRA(false)
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
    assertCCAllowancesLink(false)
  })

  const lt1haZon1TestCases = [
    [mockPolygons.fz1_only_lt_1_ha_sw, 'with Surface Water'],
    [mockPolygons.fz1_only_lt_1_ha_rsd, 'with Rivers and Seas defended'],
    [mockPolygons.fz1_only_lt_1_ha_rsd_cc, 'with Rivers and Seas defended CC'],
    [mockPolygons.fz1_only_lt_1_ha_rs, 'with Rivers and Seas undefended'],
    [mockPolygons.fz1_only_lt_1_ha_rs_cc, 'with Rivers and Seas undefended CC']
  ]
  lt1haZon1TestCases.forEach(([polygon, description]) => {
    it(`should have correct copy for Zone 1 < 1ha ${description}`, async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${polygon}` })
      document.body.innerHTML = response.payload
      assertFloodZoneCopy(1)
      assertFraCopy(polygon !== mockPolygons.fz1_only_lt_1_ha_sw)
      assertFZ1Copy()
      assertFZ1lt1haCopy(polygon === mockPolygons.fz1_only_lt_1_ha_sw)
      assertFZ1gt1haCopy(false)
      assertFZ1lt1haFRA(polygon !== mockPolygons.fz1_only_lt_1_ha_sw)
      assertFZ2Copy(false)
      assertFZ3Copy(false)
      assertCoreCopy()
      assertRiskAdminCopy(false)
      assertOrderFloodRiskDataButton()
      assertCCAllowancesLink(polygon === mockPolygons.fz1_only_lt_1_ha_rsd_cc || polygon === mockPolygons.fz1_only_lt_1_ha_rs_cc)
    })
  })

  it('should have correct copy for Zone 1 > 1ha', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_gt_1_ha}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(1)
    assertFraCopy()
    assertFZ1Copy()
    assertFZ1lt1haCopy(false)
    assertFZ1gt1haCopy()
    assertFZ1gt1haOrfz1lt1haFRA()
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
    assertCCAllowancesLink(false)
  })

  it('Should have correct copy for Zone 2 low risk', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_low}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(2)
    assertCoreCopy()
    assertFraCopy()
    assertFZ1Copy(false)
    assertFZ1lt1haCopy(false)
    assertFZ1lt1haFRA(false)
    assertFZ2Copy()
    assertFZ3Copy(false)
    assertSWCopy('0.1', '1 in 1000', true)
    assertROFRSDefCCCopy('0.1', '1 in 1000', true)
    assertROFRSUnDefCCCopy('0.1', '1 in 1000', true)
    assertROFRSDefCopy('0.1', '1 in 1000', true)
    assertROFRSUnDefCopy('0.1', '1 in 1000', true)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
    assertCCAllowancesLink(true)
  })

  it('Should have correct copy for Zone 2 medium risk', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_medium}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(2)
    assertCoreCopy()
    assertFraCopy()
    assertFZ1Copy(false)
    assertFZ1lt1haCopy(false)
    assertFZ1lt1haFRA(false)
    assertFZ2Copy()
    assertFZ3Copy(false)
    assertSWCopy('1', '1 in 100', true)
    assertROFRSDefCCCopy('1', '1 in 100', true)
    assertROFRSUnDefCCCopy('1', '1 in 100', true)
    assertROFRSDefCopy('1', '1 in 100', true)
    assertROFRSUnDefCopy('1', '1 in 100', true)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
    assertCCAllowancesLink(true)
  })

  it('Should have correct copy for Zone 3 high risk', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz3_high}` })
    document.body.innerHTML = response.payload
    assertFloodZoneCopy(3)
    assertCoreCopy()
    assertFraCopy()
    assertFZ1Copy(false)
    assertFZ1lt1haCopy(false)
    assertFZ1lt1haFRA(false)
    assertFZ2Copy(false)
    assertFZ3Copy()
    assertSWCopy('3.3', '1 in 30', true)
    assertROFRSDefCCCopy('3.3', '1 in 30', true)
    assertROFRSUnDefCCCopy('1', '1 in 100', true)
    assertROFRSDefCopy('3.3', '1 in 30', true)
    assertROFRSUnDefCopy('1', '1 in 100', true)
    assertRiskAdminCopy(false)
    assertOrderFloodRiskDataButton()
    assertCCAllowancesLink(true)
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
