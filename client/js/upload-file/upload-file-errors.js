const noFileSelected = {
  summary: 'No file selected',
  text: 'Select a GeoJSON (.geojson), Geopackage (.gpkg) or shapefile (.zip)'
}

const invalidFileFormat = {
  summary: 'The selected file must be a GeoJSON (.geojson), Geopackage (.gpkg) or shapefile (.zip)',
  text: 'The selected file must be a GeoJSON (.geojson), Geopackage (.gpkg) or shapefile (.zip)'
}

const tooManyNodes = {
  summary: 'The selected file contains too many nodes',
  text: 'The selected file contains too many nodes'
}

const tooManyFilesSelected = {
  summary: 'Too many files in .zip file',
  text: 'The selected shapefile contains too many individual files. Select a .zip file with 10 files or less'
}

const fileCouldNotBeRead = {
  summary: 'The selected file could not be read',
  text: 'The selected file included an error. Check the file and try again'
}

const locationFormatError = {
  summary: 'There is a problem with the way the location is formatted in the file',
  text: 'There is a problem with the way the location is formatted in the file.\n\nThe file must:',
  bullets: [
    'use British National Grid (BNG) references, which use eastings and northings instead of latitude and longitude',
    'contain a polygon, not a point or a line',
    'contain only one polygon',
    'not have any lines that cross each other (self-intersect)'
  ]
}

module.exports = {
  noFileSelected,
  invalidFileFormat,
  tooManyNodes,
  tooManyFilesSelected,
  fileCouldNotBeRead,
  locationFormatError
}
