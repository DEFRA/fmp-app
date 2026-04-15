import { definePage } from './.utils/page.js'
import { link } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/england-only',
  title: 'This service is for locations in England only'
})
// External links
export const scotlandFloodRiskLink = link('flood risk in Scotland')
export const walesFloodRiskLink = link('flood risk in Wales')
export const northernIrelandFloodRiskLink = link('flood risk in Northern Ireland')
