import { mapButton, mapLink, mapMenuButton, mapMenuOption, menuButtonOption, menuCheckboxOption, menuRadioOption, menuSection } from './.utils/map-controls.js'
import { definePage } from './.utils/page.js'

export const page = definePage({
  slug: '/map',
  title: 'Interactive map showing flood planning data'
})

// Add or edit a location boundary - Controls used to order a P4
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

// Climate change menu options for Flood zones
export const climateMenuSection = menuSection('Climate change')
export const presentDayOption = menuRadioOption('Present day')
export const year2070To2125Option = menuRadioOption('2070 to 2125')

// Climate change menu options for Surface water
export const climateMenuSectionSW = menuSection('Climate change')
export const presentDayOptionSW = menuRadioOption('Present day')
export const year2061To2125OptionSW = menuRadioOption('2061 to 2125')

// Annual likelihood of flood menu options (shown when Surface water is selected)
export const annualLikelihoodMenuSection = menuSection('Annual likelihood of flood')
export const oneIn30Option = menuRadioOption('1 in 30')
export const oneIn100Option = menuRadioOption('1 in 100')
export const oneIn1000Option = menuRadioOption('1 in 1000')

// Surface water depth menu options (shown when Surface water is selected)
export const surfaceWaterDepthMenuSection = menuSection('Depth in millimetres')
export const allDepthsOption = menuRadioOption('All depths')
export const fullExtentOfFloodingOption = menuRadioOption('Full extent of flooding')
export const extentOver150mmOption = menuRadioOption('Extent over 150mm')
export const extentOver300mmOption = menuRadioOption('Extent over 300mm')
export const extentOver600mmOption = menuRadioOption('Extent over 600mm')
export const extentOver900mmOption = menuRadioOption('Extent over 900mm')
export const extentOver1200mmOption = menuRadioOption('Extent over 1200mm')
export const extentOver2300mmOption = menuRadioOption('Extent over 2300mm')

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
export async function searchAndSelectLocation (pwPage, locationName) {
  await pwPage.click(mapSearchButton)
  await pwPage.fill(mapSearchInput, locationName)
  await pwPage.click(mapSearchResult(locationName))
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
export const climateOptionsSW = [presentDayOptionSW, year2061To2125OptionSW]
export const surfaceWaterDepthOptions = [
  allDepthsOption,
  fullExtentOfFloodingOption,
  extentOver150mmOption,
  extentOver300mmOption,
  extentOver600mmOption,
  extentOver900mmOption,
  extentOver1200mmOption,
  extentOver2300mmOption
]
export const mapFeatureOptions = [waterStorageOption, floodDefenceOption, mainRiversOption]
export const mapStyleOptions = [outdoorMapStyleOption, darkMapStyleOption, blackAndWhiteMapStyleOption]

// Locator helpers for map specs and drivers to avoid duplicated selector definitions.
export const getMapButton = (pwPage, elementOrText) => {
  const name = typeof elementOrText === 'string' ? elementOrText : elementOrText.text
  return pwPage.getByRole('button', { name })
}

export const getMapSwitch = (pwPage, elementOrText) => {
  const name = typeof elementOrText === 'string' ? elementOrText : elementOrText.text
  return pwPage.getByRole('switch', { name })
}

export const getMapSearchInput = (pwPage) => pwPage.getByRole('combobox')
export const getMapDialog = (pwPage, name) => pwPage.getByRole('dialog', { name })
export const getMapViewport = (pwPage) => pwPage.locator('#map-viewport')

// Get section button by title (with case-insensitive regex match at start)
export const getSectionButtonByTitle = (pwPage, title) => {
  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '$&')
  const regex = new RegExp(`^${escapeRegExp(title)}`, 'i')
  return pwPage.getByRole('button', { name: regex }).first()
}

// Get alert banner close button (locates the alert status and finds its close button)
export const getAlertBannerCloseButton = (pwPage) => {
  const alert = pwPage.getByRole('status').filter({ hasText: 'Click on the flood zones' }).first()
  return alert.locator('..').getByRole('button', { name: bannerCloseButton.text, exact: true })
}
