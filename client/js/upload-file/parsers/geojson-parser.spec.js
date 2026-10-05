const { parseGeoJSON } = require('./geojson-parser.js')
const { fileCouldNotBeRead } = require('../upload-file-errors.js')

const toBuffer = (obj) => new TextEncoder().encode(JSON.stringify(obj)).buffer

describe('parseGeoJSON', () => {
  it('should wrap a single Feature in a FeatureCollection', async () => {
    const feature = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] } }

    const result = await parseGeoJSON(toBuffer(feature))

    expect(result).toEqual({
      type: 'FeatureCollection',
      features: [feature]
    })
  })

  it('should return a FeatureCollection unchanged', async () => {
    const featureCollection = { type: 'FeatureCollection', features: [] }

    const result = await parseGeoJSON(toBuffer(featureCollection))

    expect(result).toEqual(featureCollection)
  })

  it('should throw fileCouldNotBeRead for invalid JSON', async () => {
    const buffer = new TextEncoder().encode('not valid json').buffer

    await expect(parseGeoJSON(buffer)).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should throw fileCouldNotBeRead for an unsupported GeoJSON type', async () => {
    const buffer = toBuffer({ type: 'GeometryCollection', geometries: [] })

    await expect(parseGeoJSON(buffer)).rejects.toThrow(fileCouldNotBeRead.summary)
  })
})
