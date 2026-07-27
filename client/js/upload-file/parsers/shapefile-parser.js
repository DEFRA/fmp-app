import JSZip from 'jszip'
import shp from 'shpjs'
import {
  validateZipSignature,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes,
  locationFormatError
} from '../upload-file-validators.js'

const parseShapefile = async (buffer) => {
  if (!validateZipSignature(buffer)) {
    throw new Error(locationFormatError)
  }

  const zip = await JSZip.loadAsync(buffer).catch(() => null)
  if (!zip) {
    throw new Error('The selected file could not be read')
  }

  const files = Object.keys(zip.files).filter(name => !zip.files[name].dir)

  if (!validateFileCount(files)) {
    throw new Error('Too many files selected')
  }

  if (!validateFileNames(files)) {
    throw new Error(locationFormatError)
  }

  if (!validateAllowedFileTypes(files)) {
    throw new Error(locationFormatError)
  }

  files
    .filter(name => name.toLowerCase().endsWith('.prj'))
    .forEach(name => zip.remove(name))

  const modifiedBuffer = await zip.generateAsync({ type: 'arraybuffer' })
  const geojson = await shp(modifiedBuffer).catch(() => null)

  if (!geojson) {
    throw new Error('The selected file could not be read')
  }

  return geojson
}

export { parseShapefile }
