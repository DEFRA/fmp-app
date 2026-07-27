import { encodePolygon } from '../../../server/services/shape-utils.js'
import {
  validateFileExtension,
  getParserForFile,
  validateGeoJSON,
  validateNodeCount,
  isValidBNG,
  locationFormatError,
  locationFormatErrorBullets
} from './upload-file-validators.js'
import { showError } from './upload-shape-file-dom.js'
import { parseShapefile } from './parsers/shapefile-parser.js'
import { parseGeoJSON } from './parsers/geojson-parser.js'
import { parseGeopackage } from './parsers/geopackage-parser.js'

const locationFormatErrorWithBullets = {
  text: locationFormatError,
  bullets: locationFormatErrorBullets
}

const parseFile = async (buffer, format) => {
  switch (format) {
    case 'shapefile':
      return parseShapefile(buffer)
    case 'geojson':
      return parseGeoJSON(buffer)
    case 'geopackage':
      return parseGeopackage(buffer)
    default:
      throw new Error('Unknown file format')
  }
}

document.getElementById('upload').addEventListener('click', async () => {
  const fileInput = document.getElementById('boundary-input')
  const file = fileInput.files[0]
  if (!file) {
    showError('No file selected')
    return
  }
  if (!validateFileExtension(file.name)) {
    showError(locationFormatErrorWithBullets)
    return
  }

  const format = getParserForFile(file.name)
  const buffer = await file.arrayBuffer()

  let geojson
  try {
    geojson = await parseFile(buffer, format)
  } catch (err) {
    if (err?.message === 'Too many files selected' || err?.message === 'The selected file could not be read') {
      showError(err.message)
      return
    }
    showError(locationFormatErrorWithBullets)
    return
  }

  const geoJSONError = validateGeoJSON(geojson)
  if (geoJSONError) {
    if (geoJSONError === locationFormatError) {
      showError(locationFormatErrorWithBullets)
      return
    }
    showError(geoJSONError)
    return
  }
  const polygon = geojson.features[0].geometry.coordinates[0]
  if (!validateNodeCount(polygon)) {
    showError('The selected file contains too many nodes')
    return
  }
  if (!isValidBNG(polygon)) {
    showError(locationFormatErrorWithBullets)
    return
  }
  const encodedPolygon = encodePolygon(polygon)
  globalThis.location.href = `/map?encodedPolygon=${encodedPolygon}`
})
