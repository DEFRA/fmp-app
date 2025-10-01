const { decodePolygon } = require('../shape-utils')
const { encode } = require('@mapbox/polyline')
const polygons = require('./__data__/polygons.json')

describe('param-polygon-decoder > decodePolygon', () => {
  polygons.forEach((polygon) => {
    const polygonString = JSON.stringify(polygon)
    it(`should encode and decode ${polygonString}`, async () => {
      const encodedPolygon = encode(polygon)
      const decodedPolygon = decodePolygon(encodedPolygon)
      expect(decodedPolygon).toEqual(polygonString)
    })

    it(`should decode ${polygonString}`, async () => {
      const decodedPolygon = decodePolygon(polygonString)
      expect(decodedPolygon).toEqual(polygonString)
    })
  })

  it('should throw errors if polygon includes anything other than array or is not an array', async () => {
    const polygon = [{ lat: 537426.67, long: 173708.12 }, [537449.62, 173707.1], [537449.2, 173702.81], [537427.03, 173703.77]]
    expect(() => decodePolygon('simplePolygon')).toThrow('Polygon must have a length of at least 4')
    expect(() => decodePolygon((JSON.stringify(polygon)))).toThrow('Error - unhandled polygon array [{"lat":537426.67,"long":173708.12},[537449.62,173707.1],[537449.2,173702.81],[537427.03,173703.77]]')
  })

  it('should throw error if not a valid polygon', async () => {
    const polygon = [[537426.67, 173708.12], [537449.62, 173707.1], [537449.2, 173702.81], [537427.03, 173703.77]]
    expect(() => decodePolygon(JSON.stringify(polygon))).toThrow('First and last coordinates should match')
  })
})
