import { definePage } from './.utils/page.js'
import { button, details, errorText, link } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/upload',
  title: 'Upload a site boundary'
})

export const continueButton = button('Continue')
export const missingFileError = errorText('No file selected')
export const fileFormatError = errorText('The selected file must be a GeoJSON (.geojson), Geopackage (.gpkg) or shapefile (.zip)')
export const geographicalError = errorText('There is a problem with the way the location is formatted in the file')
export const tooManyNodesError = errorText('The selected file contains too many nodes')
export const tooManyFilesError = errorText('Too many files in .zip file')
export const couldNotParseError = errorText('The selected file could not be read')
export const noBoundaryDetails = details('I do not have a boundary to upload')
export const mapPage = link('the map page')
