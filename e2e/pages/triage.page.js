import { definePage } from './.utils/page.js'
import { radioOption, errorText } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/triage',
  title: 'What flood information do you need?'
})

export const planningOption = radioOption('For planning purposes or scoping a site')
export const buyingSellOption = radioOption('For buying, selling or valuing a property')
export const floodHistoryOption = radioOption('To find out if your property is in an area that has flooded')
export const insuranceOption = radioOption('For insurance purposes, to find out if I am at risk of flooding')
export const otherOption = radioOption('My reason is not listed here')

export const missingSelectionError = errorText('Choose the flood information you need to continue')
