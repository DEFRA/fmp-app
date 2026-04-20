const { validateShapeFile, validateGeoJSON } = require('../validate-uploaded-shape-file')

describe('validateShapeFile', () => {
  it('should return no errors for a .zip file', () => {
    const result = validateShapeFile({ filename: 'test.zip' })
    expect(result).toEqual([])
  })

  it('should return no errors for a .gpkg file', () => {
    const result = validateShapeFile({ filename: 'test.gpkg' })
    expect(result).toEqual([])
  })

  it('should return no errors for a .geojson file', () => {
    const result = validateShapeFile({ filename: 'test.geojson' })
    expect(result).toEqual([])
  })

  it('should return an error for an invalid file extension', () => {
    const result = validateShapeFile({ filename: 'test.txt' })
    expect(result).toEqual([{
      text: 'Only upload a GeoJSON file (.geojson), Geopackage (.gpkg) or Shape files (.zip)',
      href: '#boundary'
    }])
  })

  it('should return an error for a file with no extension', () => {
    const result = validateShapeFile({ filename: 'test' })
    expect(result).toEqual([{
      text: 'Only upload a GeoJSON file (.geojson), Geopackage (.gpkg) or Shape files (.zip)',
      href: '#boundary'
    }])
  })
})

describe('validateGeoJSON', () => {
  it('should return no errors for a valid GeoJSON', () => {
    const result = validateGeoJSON({
      features: [{ geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } }]
    })
    expect(result).toEqual([])
  })

  it('should return an error if geojson is null', () => {
    const result = validateGeoJSON(null)
    expect(result).toEqual([{
      text: 'Only upload a GeoJSON with a single feature.',
      href: '#boundary'
    }])
  })

  it('should return an error if geojson has no features', () => {
    const result = validateGeoJSON({ features: [] })
    expect(result).toEqual([{
      text: 'Only upload a GeoJSON with a single feature.',
      href: '#boundary'
    }])
  })

  it('should return an error if geojson has multiple features', () => {
    const result = validateGeoJSON({
      features: [
        { geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } },
        { geometry: { type: 'Polygon', coordinates: [[[2, 2], [3, 2], [3, 3], [2, 2]]] } }
      ]
    })
    expect(result).toEqual([{
      text: 'Only upload a GeoJSON with a single feature.',
      href: '#boundary'
    }])
  })

  it('should return an error if the feature is not a Polygon', () => {
    const result = validateGeoJSON({
      features: [{ geometry: { type: 'LineString', coordinates: [] } }]
    })
    expect(result).toEqual([{
      text: 'Feature must be a single polygon.',
      href: '#boundary'
    }])
  })

  it('should not check geometry type if feature count is invalid', () => {
    const result = validateGeoJSON({ features: [] })
    expect(result).toHaveLength(1)
    expect(result[0].text).toContain('single feature')
  })
})
