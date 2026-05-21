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

  test('confirms the What is the data services platform? link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.howToUseFloodMapForPlanningData.dataServicesPlatformAnchorLink)
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

  /* No longer in use - Retained for reference
  test('confirms the Suitability of datasets for development planning (PDF)  link is present and reachable', { tag: '@noDeps' }, async ({ steps }) => {
    await steps.expectLinkTargetReachable(pages.howToUseFloodMapForPlanningData.prepareFloodRiskAssessmentLink)
  })
  */

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

  test('navigates to Find out more about using peak rainfall intensity allowances to assess surface water flood risk. when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.peakRainfallIntensityAllowancesLink)
    await steps.expectUrlContains('peak-rainfall-intensity-allowances')
  })

  test('navigates to hydrology data explorer when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.hydrologyDataExplorerLink)
    await steps.expectUrlContains('climate-change-allowances/rainfall')
  })

  test('navigates to More information on when to use other climate change allowances. when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.otherClimateChangeAllowancesLink)
    await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
  })

  test('navigates to data services platform (DSP) when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.dataServicesPlatformLink)
    await steps.expectUrlContains('environment.data.gov.uk')
  })

  test('navigates to DSP flood zones when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.dspFloodZonesLink)
    await steps.expectUrlContains('04532375-a198-476e-985e-0579a0a11b47')
  })

  test('navigates to DSP flood zones plus climate change when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.dspFloodZonesPlusClimateChangeLink)
    await steps.expectUrlContains('59065c43-257e-4867-8798-fd2366156a6b')
  })

  test('navigates to DSP water storage areas when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.dspWaterStorageAreasLink)
    await steps.expectUrlContains('86ca7c80-d465-11e4-afe1-f0def148f590')
  })
  /* To be added when the surface water dataset is available on the DSP
  test('navigates to surface water when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.howToUseFloodMapForPlanningData.dspSurfaceWaterLink)
    await steps.expectUrlContains('environment.data.gov.uk/datasets/surface-water')
  })
  */
})
