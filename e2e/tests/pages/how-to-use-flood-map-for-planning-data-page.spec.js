import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('How to use flood map for planning data page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.howToUseFloodMapForPlanningData.page)
  })

  it('displays page content @validation', async () => {
    await steps.expectText('How to use flood map for planning data')
  })
  it('confirms the how should the data be used? link is present@routing', async () => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.howToUseDataLink)
  })
  it('confirms the what are ‘flood zones plus climate change’? link is present@routing', async () => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.floodZonesPlusClimateChangeLink)
  })
  it('confirms the what does ‘climate change data unavailable’ mean? link is present@routing', async () => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.climateChangeDataUnavailableLink)
  })
  it('navigates to the terms and conditions page when clicking the link @routing', async () => {
    await steps.clickLink(pages.cookies.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })

  // The following tests validate that external links can be reached.
  it('navigates to How to prepare a strategic flood risk assessment page when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.prepareStrategicFloodRiskAssessmentLink)
    await steps.expectUrlContains('strategic-flood-risk-assessment')
  })
  /* it('navigates to Suitability of datasets for development planning (PDF) when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.prepareFloodRiskAssessmentLink)
    await steps.expectUrlContains('Product-suitability-for-planning')
  }) */
  it('navigates to National Planning Policy Framework when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.nationalPlanningPolicyFrameworkLink)
    await steps.expectUrlContains('national-planning-policy-framework')
  })
  it('navigates to Planning practice guidance when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.planningPracticeGuidanceLink)
    await steps.expectUrlContains('flood-risk-and-coastal-change#para27')
  })
  it('navigates to table 2 of Planning Practice Guidance when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.table2PlanningPracticeGuidanceLink)
    await steps.expectUrlContains('flood-risk-and-coastal-change#table2')
  })
  it('navigates to national flood risk standing advice for local planning authorities when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.nationalFloodRiskStandingAdviceLink)
    await steps.expectUrlContains('flood-risk-assessment-local-planning-authorities')
  })
  it('navigates to flood risk assessments: applying for planning permission. when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.applyingForPlanningPermissionLink)
    await steps.expectUrlContains('flood-risk-assessment-for-planning-applications')
  })
  it('navigates to flood risk assessments climate change allowances guidance. when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.climateChangeAllowancesGuidanceLink)
    await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
  })
  it('navigates to More information on when to use other climate change allowances. when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.otherClimateChangeAllowancesLink)
    await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
  })
  it('navigates to Find out more about using peak rainfall intensity allowances to assess surface water flood risk. when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.findOutMoreAboutPeakRainfallIntensityAllowancesLink)
    await steps.expectUrlContains('using-peak-rainfall-intensity-allowances')
  })
  it('navigates to hydrology data explorer when clicking the link @routing', async () => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.hydrologyDataExplorerLink)
    await steps.expectUrlContains('climate-change-allowances/rainfall')
  })
})
