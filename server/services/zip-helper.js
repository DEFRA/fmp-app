const JSZip = require('jszip')
const maxZipSizeBytes = 1024 * 1024 // 1mb

const extractProjectionFiles = async (buffer) => {
  const errorSummary = []
  if (buffer.byteLength > maxZipSizeBytes) {
    errorSummary.push({
      text: 'Zip file is too large. Maximum allowed size is 1mb.',
      href: '#boundary'
    })
    return errorSummary
  }
  const zip = await JSZip.loadAsync(buffer)
  Object.keys(zip.files)
    .filter(name => name.toLowerCase().endsWith('.prj'))
    .forEach(name => zip.remove(name))

  return zip.generateAsync({ type: 'arraybuffer' })
}

module.exports = { extractProjectionFiles }
