import { definePage } from './.utils/page.js'
import { button, details, link, textInput, selectInput } from './.utils/form-controls.js'

export const titleForZone = (floodZone) => `This location is in flood zone ${floodZone}`
export const pageWithZone = (floodZone) => definePage({
  slug: '/results',
  title: titleForZone(floodZone)
})

// P1 Map Controls
export const addReferenceToFloodMapDetails = details('Add a reference to the flood map and set the scale')
export const addReferenceInput = textInput('Add a reference')
export const scaleSelect = selectInput('Scale')
export const downloadFloodMapButton = button('Download flood map for this location (PDF)')
export const orderFloodRiskDataButton = link('Order flood risk data')

// Only shown for areas over 300ha results pages
export const editBoundaryLink = link('Edit boundary')

// Internal links
// export const backToSearchLink = link('Back to search')//remove
export const findOutMoreAboutFloodZonesLink = link('Find out more about flood zones and what they mean.')
export const redrawBoundaryLink = link('Redraw the boundary of your site')
export const searchForDifferentLocationLink = link('Search for a different location')
export const termsAndConditionsLink = link('terms and conditions')
export const iNeedHelpDecidingWhatToIncludeInMyPlanningAppLink = link('I need help deciding what to include in my planning application')
export const seeThisRiskOnTheMapLink = link('See this risk on the map')
// only shown for flood zone 2 and 3 results
export const findOutMoreAboutThisDataLink = link('Find out more about this data and how it should be used')

// External links
// vulnerability classification link only shows for Flood Zone 1 under 1ha results
export const vulnerabilityClassificationLink = link('vulnerability classification')
export const residualRiskLink = link('residual risk')
// Climate change allowances link will only be shown when SW goes into the app
export const findOutMoreAboutClimateChangeAllowancesLink = link('Find out more about climate change allowances')
export const findOutWhatProductsAreAvailableLink = link('Find out what products are available')
