const maxZipBytesSize = 1024 * 1024 // 1mb
const maxNodes = 500
const maxFiles = 10
const allowedExtentions = ['.shp', '.shx', '.dbf', '.prj', '.cpg', '.qpj', 'sbn', 'sbx']

const validateFileExtension = (fileName) => fileName.toLowerCase().endsWith('.zip')

const validateFileSize = (size) => size <= maxZipBytesSize

const validateZipSignature = (buffer) => {
  const signature = new Uint8Array(buffer.slice(0, 2))
  return signature[0] === 0x50 && signature[1] === 0x4B
}

const validateFileCount = (files) => files.length <= maxFiles

const validateFileNames = (files) => files.every(name => !name.includes('..') && !name.startsWith('/'))

const validateAllowedFileTypes = (files) => files.every(
  name => allowedExtentions.some(ext => name.toLowerCase().endsWith(ext))
)

const validateGeoJSON = (geojson) => {
  if (!geojson || !geojson.features || geojson.features.length !== 1) {
    return 'Only upload a shape file containing a single polygon.'
  }
  if (geojson.features[0].geometry.type !== 'Polygon') {
    return 'The shape file must contain a polygon, not a point or line.'
  }
  return null
}

const validateNodeCount = (polygon) => polygon.length <= maxNodes

const isValidBNG = (coordinates) => {
  return coordinates.every(([easting, northing]) =>
    easting >= 0 && easting <= 700000 &&
    northing >= 0 && northing <= 1300000
  )
}

module.exports = {
  validateFileExtension,
  validateFileSize,
  validateZipSignature,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes,
  validateGeoJSON,
  validateNodeCount,
  isValidBNG,
  maxZipBytesSize,
  maxNodes,
  maxFiles
}
