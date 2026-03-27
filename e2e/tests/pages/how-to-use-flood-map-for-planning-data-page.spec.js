import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('How to use flood map for planning data page', { tag: '@noDeps' }, () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.howToUseFloodMapForPlanningData.page)
  })

  test('displays page content', async () => {
    await steps.expectText('How to use flood map for planning data')
  })

  test('confirms the how should the data be used? link is present', async () => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.howToUseDataLink)
  })

  test('confirms the "what are flood zones plus climate change"? link is present', async () => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.floodZonesPlusClimateChangeLink)
  })

  test('confirms the what does ‘climate change data unavailable’ mean? link is present', async () => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.climateChangeDataUnavailableLink)
  })

  test('navigates to the terms and conditions page when clicking the link', async () => {
    await steps.clickLink(pages.cookies.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })

  // The following tests validate that external links can be reached.

  test('navigates to How to prepare a strategic flood risk assessment page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.prepareStrategicFloodRiskAssessmentLink)
    await steps.expectUrlContains('strategic-flood-risk-assessment')
  })
  /* it('navigates to Suitability of datasets for development planning (PDF) when clicking the link', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.prepareFloodRiskAssessmentLink)
    await steps.expectUrlContains('Product-suitability-for-planning')
  }) */

  test('navigates to National Planning Policy Framework when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.nationalPlanningPolicyFrameworkLink)
    await steps.expectUrlContains('national-planning-policy-framework')
  })

  test('navigates to Planning practice guidance when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.planningPracticeGuidanceLink)
    await steps.expectUrlContains('flood-risk-and-coastal-change#para27')
  })

  test('navigates to table 2 of Planning Practice Guidance when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.table2PlanningPracticeGuidanceLink)
    await steps.expectUrlContains('flood-risk-and-coastal-change#table2')
  })

  test('navigates to national flood risk standing advice for local planning authorities when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.nationalFloodRiskStandingAdviceLink)
    await steps.expectUrlContains('flood-risk-assessment-local-planning-authorities')
  })

  test('navigates to flood risk assessments: applying for planning permission. when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.applyingForPlanningPermissionLink)
    await steps.expectUrlContains('flood-risk-assessment-for-planning-applications')
  })

  test('navigates to flood risk assessments climate change allowances guidance. when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.climateChangeAllowancesGuidanceLink)
    await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
  })

  test('navigates to More information on when to use other climate change allowances. when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.otherClimateChangeAllowancesLink)
    await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
  })

  test('navigates to Find out more about using peak rainfall intensity allowances to assess surface water flood risk. when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.findOutMoreAboutPeakRainfallIntensityAllowancesLink)
    await steps.expectUrlContains('using-peak-rainfall-intensity-allowances')
  })

  test('navigates to hydrology data explorer when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.hydrologyDataExplorerLink)
    await steps.expectUrlContains('climate-change-allowances/rainfall')
  })
})
