import { definePage } from './.utils/page.js'
import { link } from './.utils/form-controls.js'

export const titleForZone = (floodZone) => `This location is in flood zone ${floodZone}`
export const pageWithZone = (floodZone) => definePage({
  key: 'Results',
  slug: '/results',
  title: titleForZone(floodZone)
})

export const orderFloodRiskDataButton = link('Order flood risk data')

export const backToSearchLink = link('Back to search')
export const floodZoneResultsExplainedLink = link('Flood zone results explained')
