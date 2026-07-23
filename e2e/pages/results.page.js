import { definePage } from './.utils/page.js'
import { button, details, link, textInput, selectInput } from './.utils/form-controls.js'

export const titleForZone = (floodZone) => `This location is in flood zone ${floodZone}`
export const pageWithZone = (floodZone) => definePage({
  slug: '/results',
  title: titleForZone(floodZone)
})

// URL helper
export const slug = (polygon) => `/results?encodedPolygon=${encodeURIComponent(polygon)}`
export const pageForPolygon = (floodZone, polygon) => ({
  ...pageWithZone(floodZone),
  slug: slug(polygon)
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

// Conditional page content
export const fraRequiredText =
  'Based on our flood risk data, you need to carry out a flood risk assessment (FRA) as part of the planning application for this development.'
export const fz1LessThan1HaText =
  'Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where'
export const fz1MoreThan1HaText =
  'Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).'
export const allFraTexts = [fraRequiredText, fz1LessThan1HaText, fz1MoreThan1HaText]
export const noJurisdictionText = 'We cannot identify the correct Environment Agency team for your location.'

// Surface water probability messaging
export const sw1in1000PdAnd2061to2125Text =
  'Between 2061 and 2125 the chance of surface water flooding at this location could be 0.1% (1 in 1000) each year.'
export const sw1in1000PdText =
  'The chance of surface water flooding at this location could be more than 0.1% (1 in 1000) each year.'
export const sw1in100PdAnd2061to2125Text =
  'Between 2061 and 2125 the chance of surface water flooding at this location could be 1% (1 in 100) each year.'
export const sw1in100PdText =
  'The chance of surface water flooding at this location could be more than 1% (1 in 100) each year.'
export const sw1in30PdAnd2061to2125Text =
  'Between 2061 and 2125 the chance of surface water flooding at this location could be 3.3% (1 in 30) each year.'
export const sw1in30PdText =
  'The chance of surface water flooding at this location could be more than 3.3% (1 in 30) each year.'

// Risk profiles
export const riskIntro = 'In your proposed development site there is a risk of flooding from:'
const surfaceWaterRisk = 'surface water'
export const riskProfilesSection = '[data-testid="risk-profiles"]' // Selector for the risk profiles section
export const riskProfiles = {
  surfaceWater: [riskIntro, surfaceWaterRisk],
  fluvialAndSurfaceWater: [riskIntro, 'rivers (fluvial)', surfaceWaterRisk],
  tidalAndSurfaceWater: [riskIntro, 'the sea (tidal)', surfaceWaterRisk],
  fluvialTidalAndSurfaceWater: [riskIntro, 'rivers and the sea (fluvial and tidal)', surfaceWaterRisk],
  fluvialAndTidal: [riskIntro, 'rivers and the sea (fluvial and tidal)'],
  fluvial: [riskIntro, 'rivers (fluvial)'],
  tidal: [riskIntro, 'the sea (tidal)'],
  climateChange: [riskIntro, 'rivers and the sea (fluvial or tidal) due to climate change'],
  climateChangeAndSurfaceWater: [riskIntro, 'rivers and the sea (fluvial or tidal) due to climate change', surfaceWaterRisk]
}
export const allRiskLines = [...new Set(Object.values(riskProfiles).flat().filter((line) => line !== riskIntro))]

// Risk profile assertion
export const expectRiskProfileTexts = async (page, expectedTexts, allTexts) => {
  const { expect } = await import('@playwright/test')
  const main = page.getByRole('main')
  const [introText, ...expectedRiskItems] = expectedTexts

  const riskIntroLocator = main.getByText(introText, { exact: true }).first()
  await expect(riskIntroLocator).toBeVisible()

  // Risk lines are shown in the first list within the same content block as the intro text.
  const riskList = riskIntroLocator.locator('..').getByRole('list').first()

  await expect(riskList).toBeVisible()

  for (const text of expectedRiskItems) {
    await expect(riskList.getByText(text, { exact: true })).toBeVisible()
  }

  const allRiskItems = allTexts.filter((text) => text !== introText)
  for (const text of allRiskItems) {
    if (!expectedRiskItems.includes(text)) {
      await expect(riskList.getByText(text, { exact: true })).toHaveCount(0)
    }
  }
}
