import { mapButton, mapLink, mapMenuButton, mapMenuOption, menuButtonOption, menuCheckboxOption, menuRadioOption, menuSection } from './.utils/map-controls.js'
import { definePage } from './.utils/page.js'

export const page = definePage({
  slug: '/map',
  title: 'Interactive map showing flood planning data'
})

// Controls used to order a P4
export const locationMenuSection = menuSection('Get data for your location')
export const addPolygonOption = menuButtonOption('Add polygon')
export const addSquareOption = menuButtonOption('Add square')
export const editShapeOption = menuButtonOption('Edit shape')
export const deleteShapeOption = menuButtonOption('Delete shape')

// Datasets menu options
export const datasetsMenuSection = menuSection('Datasets')
export const floodZones2And3Option = menuRadioOption('Flood zones 2 and 3')
export const surfaceWaterOption = menuRadioOption('Surface water')
export const noneOption = menuRadioOption('None')

// Climate change menu options
export const climateMenuSection = menuSection('Climate change')
export const presentDayOption = menuRadioOption('Present day')
export const year2070To2125Option = menuRadioOption('2070 to 2125')

// Annual likelihood of flood menu options (shown when Surface water is selected)
export const annualLikelihoodMenuSection = menuSection('Annual likelihood of flood')
export const oneIn30Option = menuRadioOption('1 in 30')
export const oneIn100Option = menuRadioOption('1 in 100')
export const oneIn1000Option = menuRadioOption('1 in 1000')

// Map features menu options
export const mapFeaturesMenuSection = menuSection('Map features')
export const waterStorageOption = menuCheckboxOption('Water storage')
export const floodDefenceOption = menuCheckboxOption('Flood defence')
export const mainRiversOption = menuCheckboxOption('Main Rivers')

export const getSummaryReportButton = mapButton('Get summary report')
export const finishButton = mapButton('Finish')

// Map Interaction Controls
export const zoomInButton = mapButton('Zoom in')
export const zoomOutButton = mapButton('Zoom out')
export const mapHelpLink = mapLink('Help')
export const mapKeyButton = mapButton('Key')

export const mapSearchButton = mapButton('Search')

// Search input field
export const mapSearchInput = {
  type: 'mapSearchInput'
}

// Dynamic search result (by visible text)
export const mapSearchResult = (text) => ({
  type: 'mapSearchResult',
  text
})

// Helper to perform a full search + select
// Note: click() and fill() need to be imported from Playwright page object
export async function searchAndSelectLocation (page, locationName) {
  await page.click(mapSearchButton)
  await page.fill(mapSearchInput, locationName)
  await page.click(mapSearchResult(locationName))
}

export const mapStyleMenuButton = mapMenuButton('Choose map style')
// Map style options
export const outdoorMapStyleOption = mapMenuOption('Outdoor')
export const darkMapStyleOption = mapMenuOption('Dark')
export const blackAndWhiteMapStyleOption = mapMenuOption('Black and white')

// Dismissible banner
export const bannerCloseButton = mapButton('Close panel')

// Grouped option arrays for use in tests
export const configSectionMenus = [
  locationMenuSection,
  datasetsMenuSection,
  climateMenuSection,
  mapFeaturesMenuSection
]
export const datasetOptions = [floodZones2And3Option, surfaceWaterOption, noneOption]
export const annualLikelihoodOptions = [oneIn30Option, oneIn100Option, oneIn1000Option]
export const climateOptions = [presentDayOption, year2070To2125Option]
export const mapFeatureOptions = [waterStorageOption, floodDefenceOption, mainRiversOption]
export const mapStyleOptions = [outdoorMapStyleOption, darkMapStyleOption, blackAndWhiteMapStyleOption]

// Locator helpers for map specs and drivers to avoid duplicated selector definitions.
export const getMapButton = (page, elementOrText) => {
  const name = typeof elementOrText === 'string' ? elementOrText : elementOrText.text
  return page.getByRole('button', { name })
}

export const getMapSwitch = (page, elementOrText) => {
  const name = typeof elementOrText === 'string' ? elementOrText : elementOrText.text
  return page.getByRole('switch', { name })
}

export const getMapSearchInput = (page) => page.getByRole('combobox')
export const getMapDialog = (page, name) => page.getByRole('dialog', { name })
export const getMapViewport = (page) => page.locator('#map-viewport')
