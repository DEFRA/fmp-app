import { definePage } from './.utils/page.js'
import { link } from './.utils/form-controls.js'

export const page = definePage({
  key: 'HowToUseFloodMapForPlanningData',
  slug: '/how-to-use-flood-map-for-planning-data',
  title: 'How to use flood map for planning data'
})
// Internal links
export const howToUseDataLink = link('how should the data be used?')
export const floodZonesPlusClimateChangeLink = link('flood zones plus climate change')
export const climateChangeDataUnavailableLink = link('what does ‘climate change data unavailable’ mean?')
export const termsAndConditionsLink = link('Terms and conditions')

// External links
export const prepareStrategicFloodRiskAssessmentLink = link('prepare a strategic flood risk assessment')
// export const prepareFloodRiskAssessmentLink = link('suitability of datasets for development planning (PDF)')
export const nationalPlanningPolicyFrameworkLink = link('National Planning Policy Framework')
export const planningPracticeGuidanceLink = link('planning practice guidance')
export const table2PlanningPracticeGuidanceLink = link('table 2 of Planning Practice Guidance')
export const nationalFloodRiskStandingAdviceLink = link('national flood risk standing advice for local planning authorities')
export const applyingForPlanningPermissionLink = link('flood risk assessments: applying for planning permission.')
export const climateChangeAllowancesGuidanceLink = link('flood risk assessments climate change allowances guidance.')
export const otherClimateChangeAllowancesLink = link('More information on when to use other climate change allowances.')
export const findOutMoreAboutPeakRainfallIntensityAllowancesLink = link('Find out more about using peak rainfall intensity allowances to assess surface water flood risk.')
export const hydrologyDataExplorerLink = link('hydrology data explorer')
