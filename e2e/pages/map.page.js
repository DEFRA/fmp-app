import { mapButton, mapButtonById, mapButtonLink, mapMenuOption, mapSwitch, menuItemOption, menuRadioOption } from './.utils/map-controls.js'
import { definePage } from './.utils/page.js'

export const page = definePage({
  slug: '/map',
  title: 'Interactive map showing flood planning data'
})

// Accordion sections
export const layersSection = 'Layers'
export const locationBoundarySection = 'Add location boundary'
export const annualLikelihoodSection = 'Annual likelihood of flooding'
export const depthSection = 'Depth in millimetres'

// Location boundary controls
export const addPolygonOption = menuItemOption('Add polygon')
export const addSquareOption = menuItemOption('Add square')
export const uploadBoundaryOption = menuItemOption('Upload a boundary')
export const editShapeOption = menuItemOption('Edit shape')
export const deleteShapeOption = menuItemOption('Delete shape')

// Dataset options
export const floodZones2And3Option = menuRadioOption('Flood zones')
export const surfaceWaterOption = menuRadioOption('Surface water')
export const noneOption = menuRadioOption('None')

// Climate change
export const presentDayOption = menuRadioOption('Present day')
export const year2070To2125Option = menuRadioOption('2070 to 2125')

// Climate change (Surface water - different label)
export const year2061To2125Option = menuRadioOption('2061 to 2125')

// Annual likelihood (Surface water)
export const oneIn30Option = menuRadioOption('1 in 30')
export const oneIn100Option = menuRadioOption('1 in 100')
export const oneIn1000Option = menuRadioOption('1 in 1000')

// Depth (Surface water)
export const allDepthsOption = menuRadioOption('All depths')
export const fullExtentOfFloodingOption = menuRadioOption('Full extent of flooding')
export const extentOver150mmOption = menuRadioOption('Extent over 150mm')
export const extentOver300mmOption = menuRadioOption('Extent over 300mm')
export const extentOver600mmOption = menuRadioOption('Extent over 600mm')
export const extentOver900mmOption = menuRadioOption('Extent over 900mm')
export const extentOver1200mmOption = menuRadioOption('Extent over 1200mm')
export const extentOver2300mmOption = menuRadioOption('Extent over 2300mm')

// Map feature switches
export const waterStorageSwitch = mapSwitch('Water storage')
export const floodDefenceSwitch = mapSwitch('Flood defence')
export const mainRiversSwitch = mapSwitch('Main rivers')

// Map toolbar
export const getSummaryReportButton = mapButton('Get summary report')
export const drawDoneButton = mapButtonById('map-draw-done')
export const drawCancelButton = mapButtonById('map-draw-cancel')
export const frameDoneButton = mapButtonById('map-frame-done')
export const frameCancelButton = mapButtonById('map-frame-cancel')
export const zoomInButton = mapButton('Zoom in')
export const zoomOutButton = mapButton('Zoom out')
// Anchor has role="button" overriding its native link role
export const helpLink = mapButtonLink('Help')
export const searchButton = mapButton('Search')
export const stylesButton = mapButton('Choose map style')

// Map style options
export const outdoorMapStyleOption = mapMenuOption('Outdoor')
export const darkMapStyleOption = mapMenuOption('Dark')
export const blackAndWhiteMapStyleOption = mapMenuOption('Black and white')

// Grouped arrays
export const datasetOptions = [floodZones2And3Option, surfaceWaterOption, noneOption]
export const annualLikelihoodOptions = [oneIn30Option, oneIn100Option, oneIn1000Option]
export const climateOptions = [presentDayOption, year2070To2125Option]
export const climateOptionsSW = [presentDayOption, year2061To2125Option]
export const mapFeatureSwitches = [waterStorageSwitch, floodDefenceSwitch, mainRiversSwitch]
export const mapStyleOptions = [outdoorMapStyleOption, darkMapStyleOption, blackAndWhiteMapStyleOption]
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
