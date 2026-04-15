import { definePage } from './.utils/page.js'
import { link } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/confirmation',
  title: 'Request submitted'
})

// Internal link
export const goBackToYourFloodInformationSummaryPageLink = link('Go back to your flood information summary page')
// External links
export const contactEmailLink = link('neyorkshire@environment-agency.gov.uk')
export const toGetMoreInformationLink = link('to get more information to help you complete a flood risk assessment (order products 5, 6, 7 or 8)')
export const contactEnvironmentAgencyLink = link('contact the Environment Agency')
