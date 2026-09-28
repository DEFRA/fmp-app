const {
  noFileSelected,
  invalidFileFormat,
  tooManyNodes,
  tooManyFilesSelected,
  fileCouldNotBeRead,
  locationFormatError
} = require('./upload-file-errors.js')

describe('upload-file-errors', () => {
  it('noFileSelected should have a summary and text', () => {
    expect(noFileSelected).toEqual({
      summary: 'No file selected',
      text: 'Select a GeoJSON (.geojson), Geopackage (.gpkg) or shapefile (.zip)'
    })
  })

  it('invalidFileFormat should have a summary and text', () => {
    expect(invalidFileFormat).toEqual({
      summary: 'The selected file must be a GeoJSON (.geojson), Geopackage (.gpkg) or shapefile (.zip)',
      text: 'The selected file must be a GeoJSON (.geojson), Geopackage (.gpkg) or shapefile (.zip)'
    })
  })

  it('tooManyNodes should have a summary and text', () => {
    expect(tooManyNodes).toEqual({
      summary: 'The selected file contains too many nodes',
      text: 'The selected file contains too many nodes, or connecting points, in the polygon. Select a file with less than 500 nodes'
    })
  })

  it('tooManyFilesSelected should have a summary and text', () => {
    expect(tooManyFilesSelected).toEqual({
      summary: 'Too many files in .zip file',
      text: 'The selected shapefile contains too many individual files. Select a .zip file with 10 files or less'
    })
  })

  it('fileCouldNotBeRead should have a summary and text', () => {
    expect(fileCouldNotBeRead).toEqual({
      summary: 'The selected file could not be read',
      text: 'The selected file included an error. Check the file and try again'
    })
  })

  it('locationFormatError should have a summary, text and bullets', () => {
    expect(locationFormatError.summary).toBe('There is a problem with the way the location is formatted in the file')
    expect(locationFormatError.text).toBe('There is a problem with the way the location is formatted in the file.\n\nThe file must:')
    expect(locationFormatError.bullets).toEqual([
      'use British National Grid (BNG) references, which use eastings and northings instead of latitude and longitude',
      'contain a polygon, not a point or a line',
      'contain only one polygon',
      'not have any lines that cross each other (self-intersect)'
    ])
  })
})
