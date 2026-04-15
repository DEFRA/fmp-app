import { definePage } from './.utils/page.js'
import { button, link } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/',
  title: 'Get flood risk information for planning in England'
})

export const startButton = button('Start now')

// Internal links
export const howToUseDataLink = link('Find out more about flood map for planning data and how it should be used')
export const termsAndConditionsLink = link('terms and conditions')

// External links
export const scotlandFloodRiskLink = link('flood risk in Scotland')
export const walesFloodRiskLink = link('flood risk in Wales')
export const northernIrelandFloodRiskLink = link('flood risk in Northern Ireland')
export const floodRiskAssessmentGuidanceLink = link('Find out more about flood risk assessments for planning permission')
export const contactEnvironmentAgencyLink = link('contact the Environment Agency')
export const callChargesLink = link('Find out about call charges')
