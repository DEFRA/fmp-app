import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('How to use flood map for planning data page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.howToUseFloodMapForPlanningData.page)
  })

  test('displays page content', async ({ steps }) => {
    await steps.expectText('How to use flood map for planning data')
  })

  test('confirms the how should the data be used? link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.howToUseDataLink)
  })

  test('confirms the "what are flood zones plus climate change"? link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.floodZonesPlusClimateChangeLink)
  })

  test('confirms the what does ‘climate change data unavailable’ mean? link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.climateChangeDataUnavailableLink)
  })

  test('navigates to the terms and conditions page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })
})

test.describe('How to use flood map for planning data page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.howToUseFloodMapForPlanningData.page)
  })

  test('navigates to How to prepare a strategic flood risk assessment page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.prepareStrategicFloodRiskAssessmentLink)
    await steps.expectUrlContains('strategic-flood-risk-assessment')
  })

  test('confirms the Suitability of datasets for development planning (PDF)  link is present and reachable', { tag: '@noDeps' }, async ({ steps }) => {
    await steps.expectLinkTargetReachable(pages.howToUseFloodMapForPlanningData.prepareFloodRiskAssessmentLink)
  })

  test('navigates to National Planning Policy Framework when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.nationalPlanningPolicyFrameworkLink)
    await steps.expectUrlContains('national-planning-policy-framework')
  })

  test('navigates to Planning practice guidance when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.planningPracticeGuidanceLink)
    await steps.expectUrlContains('flood-risk-and-coastal-change#para27')
  })

  test('navigates to table 2 of Planning Practice Guidance when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.table2PlanningPracticeGuidanceLink)
    await steps.expectUrlContains('flood-risk-and-coastal-change#table2')
  })

  test('navigates to national flood risk standing advice for local planning authorities when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.nationalFloodRiskStandingAdviceLink)
    await steps.expectUrlContains('flood-risk-assessment-local-planning-authorities')
  })

  test('navigates to flood risk assessments: applying for planning permission. when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.applyingForPlanningPermissionLink)
    await steps.expectUrlContains('flood-risk-assessment-for-planning-applications')
  })

  test('navigates to flood risk assessments climate change allowances guidance. when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.climateChangeAllowancesGuidanceLink)
    await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
  })

  test('navigates to More information on when to use other climate change allowances. when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.otherClimateChangeAllowancesLink)
    await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
  })
})
