import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Start now page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.home.page)
  })

  it('displays the correct page title @validation', async () => {
    await steps.expectOn(pages.home.page)
  })

  it('navigates to triage page after clicking start now @routing', async () => {
    await steps.clickButton(pages.home.startButton)
    await steps.expectOn(pages.triage.page)
  })

  it('navigates to how to use data page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.howToUseDataLink)
    await steps.expectOn(pages.howToUseFloodMapForPlanningData.page)
  })

  it('navigates to terms and conditions page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })

  // The following tests validate that external links can be reached.
  it('navigates to Scotland flood risk page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.scotlandFloodRiskLink)
    await steps.expectUrlContains('sepa.scot')
  })

  it('navigates to Wales flood risk page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.walesFloodRiskLink)
    await steps.expectUrlContains('naturalresources.wales')
  })

  it('navigates to Northern Ireland flood risk page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.northernIrelandFloodRiskLink)
    await steps.expectUrlContains('nidirect.gov.uk')
  })

  it('navigates to flood risk assessment guidance page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.floodRiskAssessmentGuidanceLink)
    await steps.expectUrlContains('when-you-need-a-flood-risk-assessment')
  })

  it('navigates to contact Environment Agency page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.contactEnvironmentAgencyLink)
    await steps.expectUrlContains('contact-the-environment-agency')
  })

  it('navigates to call charges information page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.callChargesLink)
    await steps.expectUrlContains('call-charges')
  })
})
