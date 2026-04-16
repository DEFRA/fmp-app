const JSZip = require('jszip')

const extractProjectionFiles = async (buffer) => {
  const zip = await JSZip.loadAsync(buffer)

  // Remove .prj files from the zip so we do not convert
  // we will only allow OSTN15 OS coordinates.
  Object.keys(zip.files)
    .filter(name => name.toLowerCase().endsWith('.prj'))
    .forEach(name => zip.remove(name))

  return zip.generateAsync({ type: 'arraybuffer' })
}

module.exports = { extractProjectionFiles }
