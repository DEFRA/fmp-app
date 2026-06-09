import JSZip from 'jszip'
import shp from 'shpjs'
import {
  validateZipSignature,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes
} from '../upload-file-validators.js'

const parseShapefile = async (buffer) => {
  if (!validateZipSignature(buffer)) {
    throw new Error('File does not appear to be a valid zip file.')
  }

  const zip = await JSZip.loadAsync(buffer).catch(() => null)
  if (!zip) {
    throw new Error('Could not read the zip file.')
  }

  const files = Object.keys(zip.files).filter(name => !zip.files[name].dir)

  if (!validateFileCount(files)) {
    throw new Error('Zip file contains too many files.')
  }

  if (!validateFileNames(files)) {
    throw new Error('Zip file contains invalid file names.')
  }

  if (!validateAllowedFileTypes(files)) {
    throw new Error('Zip file contains unexpected file types.')
  }

  files
    .filter(name => name.toLowerCase().endsWith('.prj'))
    .forEach(name => zip.remove(name))

  const modifiedBuffer = await zip.generateAsync({ type: 'arraybuffer' })
  const geojson = await shp(modifiedBuffer).catch(() => null)

  if (!geojson) {
    throw new Error('Could not parse the shape file. Please check the file and try again.')
  }

  return geojson
}

export { parseShapefile }
