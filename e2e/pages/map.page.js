import { mapButton, menuButtonOption, menuSection } from './.utils/map-controls.js'
import { definePage } from './.utils/page.js'

export const page = definePage({
  key: 'Map',
  slug: '/map',
  title: 'Interactive map showing flood planning data'
})

export const locationMenuSection = menuSection('Get data for your location')
export const addSquareOption = menuButtonOption('Add square')

export const getSummaryReportButton = mapButton('Get summary report')
export const finishButton = mapButton('Finish')
