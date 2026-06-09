const maxNodes = 500
const maxFiles = 10
const allowedExtentions = ['.shp', '.shx', '.dbf', '.prj', '.cpg', '.qpj', 'sbn', 'sbx']
const minCoordinateValue = 700000
const maxCoordinateValue = 1300000
const zipSignature = [0x50, 0x4B]

const validateFileExtension = (fileName) => {
  const name = fileName.toLowerCase()
  return name.endsWith('.zip') || name.endsWith('.geojson') || name.endsWith('.gpkg')
}

const getParserForFile = (fileName) => {
  const name = fileName.toLowerCase()
  if (name.endsWith('.geojson')) return 'geojson'
  if (name.endsWith('.gpkg')) return 'geopackage'
  if (name.endsWith('.zip')) return 'shapefile'
  return null
}

const validateZipSignature = (buffer) => {
  const signature = new Uint8Array(buffer.slice(0, 2))
  return signature[0] === zipSignature[0] && signature[1] === zipSignature[1]
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
    easting >= 0 && easting <= minCoordinateValue &&
    northing >= 0 && northing <= maxCoordinateValue
  )
}

module.exports = {
  validateFileExtension,
  getParserForFile,
  validateZipSignature,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes,
  validateGeoJSON,
  validateNodeCount,
  isValidBNG,
  maxNodes,
  maxFiles
}
