const { submitGetRequest } = require('../../__test-helpers__/server')
const { expectedContent } = require('../../__test-helpers__/copy')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodDataByPolygonMock')
const { config } = require('../../../config')
jest.mock('../../services/agol/getContacts')

const url = '/results'

/*
This test file is used to check the dynamic content on the results page html.
It is useful as we need to test the nunjuck logic.
'gt' stands for 'greater than' and 'lt' stands for 'lt'
*/

const expectGenericFloodZoneText = (floodZone) => {
  expectedContent('.govuk-heading-xl', `This location is in flood zone ${floodZone}`)
  expectedContent('[data-testid="fz-description"', `What flood zone ${floodZone} means`)
}

const expectAdminUpdateText = (expected) => {
  expectedContent(
    '[data-testid="understanding-changed"]',
    expected && 'Our understanding of flood risk from rivers and the sea has changed since this information was published.'
  )
}

const expectRSBulletPoint = (expected) => {
  expectedContent('[data-testid="risk-list-rivers-and-sea"]', expected && 'rivers and the sea')
}

const expectOrderP4Button = (expected = true) => {
  expectedContent('[data-testid="order-product4"]', expected && 'Order flood risk data')
  // Below email contact is hidden if the button is visible
  expectedContent('[data-testid="order-product4-email"]', !expected && 'To order flood risk data for this site, contact the Environment Agency team in Wessex at wessexenquiries@environment-agency.gov.uk')
}

const expectRSTitles = () => {
  expectedContent('#main-content > div > div > h2', 'Flood risk assessments')
  expectedContent('div.govuk-summary-card__title-wrapper > h2', 'Rivers and the sea')
}

const expectFZ1LowProb = (expected = true) => {
  expectedContent('[data-testid="fz1-probability"]', expected && 'Land within flood zone 1 has a low probability of flooding from rivers and the sea.')
  expectedContent('[data-testid="fz1-order-product4"]', expected && 'Your site is in flood zone 1, so it\'s unlikely we\'ll have any flood risk data for it')
}

const expectFZ2MedProbFRA = (expected = true) => {
  expectedContent('[data-testid="fz2-probability"]', expected && 'Land within flood zone 2 has a medium probability of flooding from rivers and the sea.')
  expectedContent('[data-testid="fz2-probability"] + p', expected && 'You need to carry out a flood risk assessment (FRA) as part of the planning application for this development.')
}

const expectFZ3HighProbFRA = (expected = true) => {
  expectedContent('[data-testid="fz3-probability"]', expected && 'Land within flood zone 3 has a high probability of flooding from rivers and the sea.')
  expectedContent('[data-testid="fz3-probability"] + p', expected && 'You need to carry out a flood risk assessment (FRA) as part of the planning application for this development.')
}

const expectFZ1lt1haNoFRA = (expected = true) => {
  expectedContent('[data-testid="fz1-lt1ha-fra"]', expected && 'Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where:')
  expectedContent('[data-testid="fz1-lt1ha-area"]', expected && 'The site you have drawn is less than 0.01ha.')
}

const expectFZ1gt1haFRA = (expected = true) => {
  expectedContent('[data-testid="fz1-gt1ha-fra"]', expected && 'Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).')
}

const expectFZ1gt1haHasDrawnSiteText = (expected = true) => {
  expectedContent('[data-testid="fz1-gt1ha-area"]', expected && 'The site you have drawn is 123.43ha.')
}

const expectFZ1lt1haHasDrawnSiteText = (expected = true) => {
  expectedContent('[data-testid="fz1-gt1ha-area"]', expected && 'The site you have drawn is less than 0.01ha.')
}

const expectFRARequired = (expected = true) => {
  expectedContent('[data-testid="fra"]', expected && 'Based on our flood risk data, you need to carry out a flood risk assessment (FRA)')
}

const expectSWInfo = (band, odds, expected = true) => {
  expectedContent('[data-testid="sw"] > div > h2', expected && 'Surface water for planning')
  expectedContent('[data-testid="sw"] > div > dl > div > dt', expected && 'Climate change: projected chance of flooding')
  expectedContent('[data-testid="sw"] > div > dl > div > dd > p:nth-child(1)', expected && 'We do not currently show climate change scenarios for surface water.')
  expectedContent('[data-testid="sw-probability"]', expected && `The chance of surface water flooding at this location could be more than ${band}% (${odds}) each year`)
}

describe('Results Page On Public', () => {
  beforeAll(() => { config.appType = 'public' })
  afterAll(() => { config.appType = 'internal' })

  describe('Flood zone 1', () => {
    it('should show RS title and bullet point, zone 1 relevant text (no FRA) when <1ha drawn', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
      document.body.innerHTML = response.payload
      expectGenericFloodZoneText(1)
      expectRSBulletPoint(true)
      expectFRARequired(false)
      expectFZ1LowProb()
      expectFZ1lt1haNoFRA()
      expectFZ1gt1haFRA(false)
      expectFZ1gt1haHasDrawnSiteText(false)
      expectFZ1lt1haHasDrawnSiteText(false)
      expectFZ2MedProbFRA(false)
      expectFZ3HighProbFRA(false)
      expectSWInfo('', '', false)
      expectRSTitles()
      expectAdminUpdateText(false)
      expectOrderP4Button()
    })

    it('should show RS title and bullet point, zone 1 relevant text (no FRA) when <1ha drawn with Surface Water', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_lt_1_ha_sw}` })
      document.body.innerHTML = response.payload
      expectGenericFloodZoneText(1)
      expectRSBulletPoint(false)
      expectFRARequired(false)
      expectFZ1LowProb()
      expectFZ1lt1haNoFRA(true)
      expectFZ1gt1haFRA(false)
      expectFZ1lt1haHasDrawnSiteText(false)
      expectFZ2MedProbFRA(false)
      expectFZ3HighProbFRA(false)
      expectRSTitles()
      expectAdminUpdateText(false)
      expectOrderP4Button()
    })

    it('should show RS title and bullet point, zone 1 relevant text (FRA required) when >1ha drawn', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_gt_1_ha}` })
      document.body.innerHTML = response.payload
      expectGenericFloodZoneText(1)
      expectRSBulletPoint(false)
      expectFRARequired()
      expectFZ1LowProb()
      expectFZ1lt1haNoFRA(false)
      expectFZ1gt1haFRA()
      expectFZ1gt1haHasDrawnSiteText()
      expectFZ2MedProbFRA(false)
      expectFZ3HighProbFRA(false)
      expectSWInfo('', '', false)
      expectRSTitles()
      expectAdminUpdateText(false)
      expectOrderP4Button()
    })


  it('should show RS title and bullet point, zone 1 relevant text (FRA required) when <1ha drawn with climate change zone', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
    document.body.innerHTML = response.payload
    expectRSBulletPoint(true)
    expectGenericFloodZoneText(1)
    expectRSTitles()
    expectFRARequired(false)
    expectFZ1LowProb(true)
    expectFZ1lt1haNoFRA(true)
    expectFZ1lt1haHasDrawnSiteText(false)
    expectFZ2MedProbFRA(false)
    expectFZ3HighProbFRA(false)
    expectSWInfo('0.1', '1 in 1000', false)
    expectAdminUpdateText(false)
    expectOrderP4Button()
  })

  it('should show RS title and bullet point, zone 1 relevant text (FRA required) when <1ha drawn with no data zone', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_no_la}` })
    document.body.innerHTML = response.payload
    expectRSBulletPoint(true)
    expectGenericFloodZoneText(1)
    expectRSTitles()
    expectFRARequired(false)
    expectFZ1LowProb(true)
    expectFZ1lt1haNoFRA(true)
    expectFZ1lt1haHasDrawnSiteText(false)
    expectFZ2MedProbFRA(false)
    expectFZ3HighProbFRA(false)
    expectSWInfo('0.1', '1 in 1000', false)
    expectAdminUpdateText(false)
    expectOrderP4Button()
  })

  it('should show RS title and bullet point, zone 1 relevant text (no FRA) when admin console updated area', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.inRiskAdmin.fz1_only}` })
    document.body.innerHTML = response.payload
    expectGenericFloodZoneText(1)
    expectRSBulletPoint(false)
    expectAdminUpdateText(true)
    expectOrderP4Button()
  })
  })

  describe('Flood zone 2', () => {
    it('should show RS title and bullet point, zone 2 low risk, 1 in 1000 SW text (FRA required)', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_low}` })
      document.body.innerHTML = response.payload
      expectGenericFloodZoneText(2)
      expectRSBulletPoint(true)
      expectRSTitles()
      expectFRARequired()
      expectFZ1LowProb(false)
      expectFZ1lt1haNoFRA(false)
      expectFZ1lt1haHasDrawnSiteText(false)
      expectFZ2MedProbFRA()
      expectFZ3HighProbFRA(false)
      expectSWInfo('0.1', '1 in 1000', true)
      expectAdminUpdateText(false)
      expectOrderP4Button()
    })
    
    it('should show RS title and bullet point, zone 2 low risk, 1 in 100 SW text (FRA required)', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_medium}` })
      document.body.innerHTML = response.payload
      expectGenericFloodZoneText(2)
      expectRSBulletPoint(true)
      expectRSTitles()
      expectFRARequired()
      expectFZ1LowProb(false)
      expectFZ1lt1haNoFRA(false)
      expectFZ1lt1haHasDrawnSiteText(false)
      expectFZ2MedProbFRA()
      expectFZ3HighProbFRA(false)
      expectSWInfo('1', '1 in 100', true)
      expectAdminUpdateText(false)
      expectOrderP4Button()
    })
  })

  describe('Flood zone 3', () => {
    it('Should have correct copy for Zone 3 high risk', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz3_high}` })
      document.body.innerHTML = response.payload
      expectGenericFloodZoneText(3)
      expectRSBulletPoint(true)
      expectRSTitles()
      expectFRARequired()
      expectFZ1LowProb(false)
      expectFZ1lt1haNoFRA(false)
      expectFZ1lt1haHasDrawnSiteText(false)
      expectFZ2MedProbFRA(false)
      expectFZ3HighProbFRA()
      expectSWInfo('3.3', '1 in 30', true)
      expectAdminUpdateText(false)
      expectOrderP4Button()
    })
  })

  it('should not show the "Order flood risk data" for opted out areas', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    expectGenericFloodZoneText(3)
    expectRSBulletPoint(true)
    expectAdminUpdateText(false)
    expectOrderP4Button(false)
  })

  it('should not show the "Order flood risk data" for opted out areas in FZ1', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz1_only}` })
    document.body.innerHTML = response.payload
    expectGenericFloodZoneText(1)
    expectRSBulletPoint(false)
    expectAdminUpdateText(false)
    expectOrderP4Button(false)
  })
})

describe('Results Page On Internal', () => {
  beforeAll(() => { config.appType = 'internal' })
  it('should show the "Order flood risk data" for opted out areas on internal', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    expectGenericFloodZoneText(3)
    expectRSBulletPoint(true)
    expectAdminUpdateText(false)
    expectOrderP4Button(true)
  })
})
