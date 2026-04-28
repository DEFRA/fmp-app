const JSZip = require('jszip')

const MAX_FILES = 6
const MAX_FILE_SIZE_BYTES = 1024 * 1024

const extractProjectionFiles = async (buffer) => {
  const zip = await JSZip.loadAsync(buffer)
  const files = Object.values(zip.files).filter(file => !file.dir)
  if (files.length > MAX_FILES) {
    throw new Error(`Zip file contains too many files. Maximum allowed is ${MAX_FILES}`)
  }
  const oversizedFile = files.find(file => file._data.uncompressedSize > MAX_FILE_SIZE_BYTES)
  if (oversizedFile) {
    throw new Error(`File ${oversizedFile.name} exceeds the maximum allowed size of 1mb`)
  }
  // Remove .prj files from the zip so we do not convert
  // we will only allow OSTN15 OS coordinates.
  Object.keys(zip.files)
    .filter(name => name.toLowerCase().endsWith('.prj'))
    .forEach(name => zip.remove(name))

  return zip.generateAsync({ type: 'arraybuffer' })
}

module.exports = { extractProjectionFiles }
