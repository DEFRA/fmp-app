import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Start now page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.home.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.home.page)
  })

  test('navigates to triage page after clicking start now', async ({ steps }) => {
    await steps.clickButton(pages.home.startButton)
    await steps.expectOn(pages.triage.page)
  })

  test('navigates to how to use data page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.howToUseDataLink)
    await steps.expectOn(pages.howToUseFloodMapForPlanningData.page)
  })

  test('navigates to terms and conditions page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })
})

test.describe('Start now page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.home.page)
  })

  test('navigates to Scotland flood risk page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.scotlandFloodRiskLink)
    await steps.expectUrlContains('sepa.scot')
  })

  test('navigates to Wales flood risk page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.walesFloodRiskLink)
    await steps.expectUrlContains('naturalresources.wales')
  })

  test('navigates to Northern Ireland flood risk page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.northernIrelandFloodRiskLink)
    await steps.expectUrlContains('nidirect.gov.uk')
  })

  test('navigates to flood risk assessment guidance page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.floodRiskAssessmentGuidanceLink)
    await steps.expectUrlContains('when-you-need-a-flood-risk-assessment')
  })

  test('navigates to contact Environment Agency page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.contactEnvironmentAgencyLink)
    await steps.expectUrlContains('contact-the-environment-agency')
  })

  test('navigates to call charges information page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.callChargesLink)
    await steps.expectUrlContains('call-charges')
  })
})
