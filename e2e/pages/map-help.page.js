import { definePage } from './.utils/page.js'
import { link } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/map-help',
  title: 'Help using the flood map'
})
// Internal links
export const accessibilityLink = link('Accessibility')
export const getMoreInformationLink = link('Get more information about a specific location')
export const drawABoundaryLink = link('Draw a boundary')
export const howToUseDataLink = link('How to use the data')
export const otherWaysToGetFloodRiskInformationLink = link('Other ways to get flood risk information')
export const findOutMoreLink = link('Find out more about flood map for planning data and how it to use it')
export const ourAccessibilityStatementLink = link('our accessibility statement')

// External links
export const callChargesLink = link('Find out about call charges')
