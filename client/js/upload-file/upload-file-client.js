import { encodePolygon } from '../../../server/services/shape-utils.js'
import {
  validateFileExtension,
  getParserForFile,
  validateGeoJSON,
  validateNodeCount,
  isValidBNG,
  maxNodes
} from './upload-file-validators.js'
import { showError } from './upload-shape-file-dom.js'
import { parseShapefile } from './parsers/shapefile-parser.js'
import { parseGeoJSON } from './parsers/geojson-parser.js'
import { parseGeopackage } from './parsers/geopackage-parser.js'

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
    showError('Please select a file.')
    return
  }
  if (!validateFileExtension(file.name)) {
    showError('Only .zip (shapefile), .geojson, or .gpkg (Geopackage) files are accepted.')
    return
  }

  const format = getParserForFile(file.name)
  const buffer = await file.arrayBuffer()

  let geojson
  try {
    geojson = await parseFile(buffer, format)
  } catch (err) {
    showError('Only .zip (shapefile), .geojson, or .gpkg (Geopackage) files are accepted.')
    return
  }

  const geoJSONError = validateGeoJSON(geojson)
  if (geoJSONError) {
    showError(geoJSONError)
    return
  }
  const polygon = geojson.features[0].geometry.coordinates[0]
  if (!validateNodeCount(polygon)) {
    showError(`File contains too many nodes. Maximum allowed is ${maxNodes}.`)
    return
  }
  if (!isValidBNG(polygon)) {
    showError('Coordinates must be in British National Grid (BNG) format.')
    return
  }
  const encodedPolygon = encodePolygon(polygon)
  globalThis.location.href = `/map?encodedPolygon=${encodedPolygon}`
})
