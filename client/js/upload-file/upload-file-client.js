import { encodePolygon } from '../../../server/services/shape-utils.js'
import {
  validateFileExtension,
  getParserForFile,
  validateGeoJSON,
  validateNodeCount,
  isValidBNG
} from './upload-file-validators.js'
import {
  noFileSelected,
  tooManyNodes,
  fileCouldNotBeRead,
  tooManyFilesSelected,
  invalidFileFormat,
  locationFormatError
} from './upload-file-errors.js'
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
  }
}

document.getElementById('upload').addEventListener('click', async () => {
  const fileInput = document.getElementById('boundary-input')
  const file = fileInput.files[0]
  if (!file) {
    showError(noFileSelected)
    return
  }
  if (!validateFileExtension(file.name)) {
    showError(invalidFileFormat)
    return
  }

  const format = getParserForFile(file.name)
  const buffer = await file.arrayBuffer()

  let geojson
  try {
    geojson = await parseFile(buffer, format)
  } catch (err) {
    if (err?.message === tooManyFilesSelected.summary) {
      showError(tooManyFilesSelected)
      return
    }
    if (err?.message === fileCouldNotBeRead.summary) {
      showError(fileCouldNotBeRead)
      return
    }
    showError(locationFormatError)
    return
  }

  const geoJSONError = validateGeoJSON(geojson)
  if (geoJSONError) {
    showError(geoJSONError)
    return
  }
  const polygon = geojson.features[0].geometry.coordinates[0]
  if (!validateNodeCount(polygon)) {
    showError(tooManyNodes)
    return
  }
  if (!isValidBNG(polygon)) {
    showError(locationFormatError)
    return
  }
  const encodedPolygon = encodePolygon(polygon)
  globalThis.location.href = `/map?encodedPolygon=${encodedPolygon}`
})
