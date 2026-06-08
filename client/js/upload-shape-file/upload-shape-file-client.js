import JSZip from 'jszip'
import shp from 'shpjs'
import { encodePolygon } from '../../../server/services/shape-utils.js'
import {
  validateFileExtension,
  validateFileSize,
  validateZipSignature,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes,
  validateGeoJSON,
  validateNodeCount,
  isValidBNG,
  maxNodes
} from './upload-shape-file-validators.js'
import { showError } from './upload-shape-file-dom.js'

document.getElementById('upload').addEventListener('click', async () => {
  const fileInput = document.getElementById('boundary-input')
  const file = fileInput.files[0]
  if (!file) {
    showError('Please select a file.')
    return
  }
  if (!validateFileExtension(file.name)) {
    showError('Only zip files are accepted.')
    return
  }
  if (!validateFileSize(file.size)) {
    showError('Zip file is too large. Maximum allowed size is 1mb.')
    return
  }
  const buffer = await file.arrayBuffer()
  if (!validateZipSignature(buffer)) {
    showError('File does not appear to be a valid zip file.')
    return
  }
  const zip = await JSZip.loadAsync(buffer).catch(() => null)
  if (!zip) {
    showError('Could not read the zip file.')
    return
  }
  const files = Object.keys(zip.files).filter(name => !zip.files[name].dir)
  if (!validateFileCount(files)) {
    showError('Zip file contains too many files.')
    return
  }
  if (!validateFileNames(files)) {
    showError('Zip file contains invalid file names.')
    return
  }
  if (!validateAllowedFileTypes(files)) {
    showError('Zip file contains unexpected file types.')
    return
  }
  files
    .filter(name => name.toLowerCase().endsWith('.prj'))
    .forEach(name => zip.remove(name))
  const modifiedBuffer = await zip.generateAsync({ type: 'arraybuffer' })
  const geojson = await shp(modifiedBuffer).catch(() => null)
  console.log('Parsed GeoJSON:', geojson)

  if (!geojson) {
    showError('Could not parse the shape file. Please check the file and try again.')
    return
  }
  const geoJSONError = validateGeoJSON(geojson)
  if (geoJSONError) {
    showError(geoJSONError)
    return
  }
  const polygon = geojson.features[0].geometry.coordinates[0]
  if (!validateNodeCount(polygon)) {
    showError(`Shape file contains too many nodes. Maximum allowed is ${maxNodes}.`)
    return
  }
  if (!isValidBNG(polygon)) {
    showError('Coordinates must be in British National Grid (BNG) format.')
    return
  }
  const encodedPolygon = encodePolygon(polygon)
  window.location.href = `/map?encodedPolygon=${encodedPolygon}`
})
