import { fileURLToPath } from 'node:url'

const filePath = name => fileURLToPath(new URL(`./Files/${name}`, import.meta.url))

export const validBoundaryFiles = [
  { type: 'geojson', path: filePath('devon.geojson') },
  { type: 'gpkg', path: filePath('cornwall.gpkg') },
  { type: 'shapefile', path: filePath('exeter.zip') }
]

// error is the name of the matching error element exported from pages/upload.page.js
export const invalidBoundaryFiles = [
  { description: 'File format error', path: filePath('KML.kml'), error: 'fileFormatError' },
  { description: 'Geographical error', path: filePath('line.geojson'), error: 'geographicalError' },
  { description: 'Exceeds maximum nodes error', path: filePath('polygon_510_nodes.geojson'), error: 'tooManyNodesError' },
  { description: 'Too many files error', path: filePath('TEST.zip'), error: 'tooManyFilesError' },
  { description: 'Could not parse error', path: filePath('corrupt.zip'), error: 'couldNotParseError' }
]
