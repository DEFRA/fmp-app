import JSZip from 'jszip'
import shp from 'shpjs'
import {
  validateZipSignature,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes
} from '../upload-file-validators.js'
import {
  locationFormatError,
  fileCouldNotBeRead,
  tooManyFilesSelected
} from '../upload-file-errors.js'

const parseShapefile = async (buffer) => {
  if (!validateZipSignature(buffer)) {
    throw new Error(locationFormatError.summary)
  }

  const zip = await JSZip.loadAsync(buffer).catch(() => null)
  if (!zip) {
    throw new Error(fileCouldNotBeRead.summary)
  }

  const files = Object.keys(zip.files).filter(name => !zip.files[name].dir)

  if (!validateFileCount(files)) {
    throw new Error(tooManyFilesSelected.summary)
  }

  if (!validateFileNames(files)) {
    throw new Error(locationFormatError.summary)
  }

  if (!validateAllowedFileTypes(files)) {
    throw new Error(locationFormatError.summary)
  }

  files
    .filter(name => name.toLowerCase().endsWith('.prj'))
    .forEach(name => zip.remove(name))

  const modifiedBuffer = await zip.generateAsync({ type: 'arraybuffer' })
  const geojson = await shp(modifiedBuffer).catch(() => null)

  if (!geojson) {
    throw new Error(fileCouldNotBeRead.summary)
  }

  return geojson
}

export { parseShapefile }
