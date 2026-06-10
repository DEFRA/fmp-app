import { definePage } from './.utils/page.js'
import { radioOption, textInput, link, errorText } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/location',
  title: 'Find the location'
})

export const findByPostcode = radioOption('Place or postcode')
export const findByNgr = radioOption('National Grid Reference (NGR)')
export const findByEastingNorthing = radioOption('Easting and northing')

export const placeOrPostcodeInput = textInput('Place or postcode')
export const ngrInput = textInput('National Grid Reference (NGR)')
export const eastingInput = textInput('Easting')
export const northingInput = textInput('Northing')

export const skipToMapLink = link('Skip to map')

// Validation error messages
export const missingSelectionError = errorText('Select a place or postcode, National Grid Reference (NGR) or an Easting and northing')

export const invalidPostcodeError = errorText('Enter a real place name or postcode')
export const noAddressFoundError = errorText('No address found for that place or postcode')

export const invalidNgrError = errorText('Enter a real National Grid Reference (NGR)')

export const missingEastingError = errorText('Enter an easting')
export const missingNorthingError = errorText('Enter a northing')
export const invalidEastingError = errorText('Enter an easting in the correct format')
export const invalidNorthingError = errorText('Enter a northing in the correct format')
