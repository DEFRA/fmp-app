const {
  getArea,
  getAreaInHectares,
  polygonToArray,
  buffPolygon,
  polygonStartEnd,
  encodePolygon,
  checkParamsForPolygon,
  getExtents,
  getDimensions
} = require('../../../server/services/shape-utils')
const zeroAreaPolygons = require('./__mocks__/zeroAreaPolygons')
const { encode } = require('@mapbox/polyline')

describe('shape-utils - polygonToArray', () => {
  it('polygonToArray should return an array for polygon strings "[[0,0],[0,10],[10,10],[10,0]]"', async () => {
    const polygonString = '[[0,0],[0,10],[10,10],[10,0]]'
    expect(polygonToArray(polygonString)).toEqual([
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0]
    ])
  })

  it('polygonToArray should return an array for polygon array [[0,0],[0,10],[10,10],[10,0]]', async () => {
    const polygonString = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0]
    ]
    expect(polygonToArray(polygonString)).toEqual([
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0]
    ])
  })
})

describe('shape-utils - getArea/getAreaInHectares', () => {
  const polygonsToTest = [
    /* [polygonString, area in m^2 (Number), 'Hectares (String to 2 dp)] */
    [undefined, undefined, undefined],
    ['', undefined, undefined],
    ['[]', 0, '0'],
    ['[[10,10]]', 0, '0'], // Point has 0 area
    ['[[10,10],[20,20]]', 0, '0'], // Line has 0 area
    ['[[0,0],[0,10],[10,0]]', 50, '0.01'], // Triangle
    ['[[866,0],[1866,0],[2732,500],[2732,1500],[1866,2000],[866,2000],[0,1500],[0,500]]', 4598000, '459.8'], // Irregular Hexagon
    ['[[0,0],[0,10],[10,10],[10,0]]', 100, '0.01'], // Square
    ['[[0,0],[0,10],[15,10],[15,5],[10,5],[10,0]]', 125, '0.01'], // 2 Squares butted together (one of 1/2 size of the other)
    ['[[100,0],[100,100],[250,100],[250,50],[200,50],[200,0]]', 12500, '1.25'] // 2 offset Squares butted together (one of 1/2 size of the other)
  ]

  polygonsToTest.forEach(([polygonString, expectedSqMeters, expectedHectares]) => {
    it(`getArea should return ${expectedSqMeters} for ${polygonString}`, async () => {
      expect(getArea(polygonString)).toEqual(expectedSqMeters)
    })

    it(`getAreaInHectares should return ${expectedHectares} for ${polygonString}`, async () => {
      expect(getAreaInHectares(polygonString)).toEqual(expectedHectares)
    })
    // Now repeat the same tests, but with polygon as an array instead of a string
    const polygon = polygonString ? JSON.parse(polygonString) : undefined
    it(`getArea should return ${expectedSqMeters} for ${polygonString} when it is an array`, async () => {
      expect(getArea(polygon)).toEqual(expectedSqMeters)
    })

    it(
      `getAreaInHectares should return ${expectedHectares} for ${polygonString} when it is an array`,
      async () => {
        expect(getAreaInHectares(polygon)).toEqual(expectedHectares)
      }
    )
  })

  zeroAreaPolygons.forEach(([zeroAreaPolygon, expectedBuffedPolygon, expectedMinMaxXY]) => {
    it(
      `polygonStartEnd for ${JSON.stringify(zeroAreaPolygon)} should return ${JSON.stringify(expectedMinMaxXY)}`,
      async () => {
        expect(polygonStartEnd(zeroAreaPolygon)).toEqual(expectedMinMaxXY)
      }
    )

    it(
      `buffPolygon should convert ${JSON.stringify(zeroAreaPolygon)} to ${JSON.stringify(expectedBuffedPolygon)}`,
      async () => {
        expect(buffPolygon(zeroAreaPolygon)).toEqual(expectedBuffedPolygon)
      }
    )
  })
})
describe('shape-utils - encode / decode polygon', () => {
  const polygon = [[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]]
  const encodedPolygon = encode(polygon)
  const polygonString = '[[111,111],[111,112],[112,112],[112,111],[111,111]]'

  describe('shape-utils - encodePolygon', () => {
    it('should process polygons into objects if they come through as arrays', async () => {
      expect(encodePolygon(polygon)).toEqual(encodedPolygon)
    })
    it('should process string polygons into objects', async () => {
      expect(encodePolygon(polygonString)).toEqual(encodedPolygon)
    })
  })

  describe('shape-utils - checkParamsForPolygon', () => {
    it('should encode polygon if a polygon array is parsed', async () => {
      expect(checkParamsForPolygon({ polygon: polygonString })).toEqual({ encodedPolygon, polygon: polygonString })
    })
    it('should decode encoded polygon if a encodedPolygon is parsed', async () => {
      expect(checkParamsForPolygon({ encodedPolygon })).toEqual({ encodedPolygon, polygon: polygonString })
    })
  })
})

describe('shape-utils - getExtents/getDimensions', () => {
  const polygonsToTest = [
    /* [polygon, [west, south, east, north], { width, height }] */
    ['[[10,20],[30,50]]', [10, 20, 30, 50], { width: 20, height: 30 }], // Line
    ['[[0,0],[0,10],[10,10],[10,0],[0,0]]', [0, 0, 10, 10], { width: 10, height: 10 }], // Square
    ['[[-5,-15],[20,3],[7,42],[-5,-15]]', [-5, -15, 20, 42], { width: 25, height: 57 }], // Triangle spanning negative coordinates
    ['[[1.005,2.005],[3.115,7.225],[1.005,2.005]]', [1.005, 2.005, 3.115, 7.225], { width: 2.11, height: 5.22 }] // Decimals rounded to 2dp
  ]

  polygonsToTest.forEach(([polygonString, expectedExtents, expectedDimensions]) => {
    it(`getExtents should return ${JSON.stringify(expectedExtents)} for ${polygonString}`, async () => {
      expect(getExtents(polygonString)).toEqual(expectedExtents)
    })

    it(`getDimensions should return ${JSON.stringify(expectedDimensions)} for ${polygonString}`, async () => {
      expect(getDimensions(polygonString)).toEqual(expectedDimensions)
    })
  })

  it('getExtents should accept a polygon array', async () => {
    expect(getExtents([[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]])).toEqual([0, 0, 10, 10])
  })

  it('getExtents should unwrap a nested polygon array', async () => {
    expect(getExtents([[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]])).toEqual([0, 0, 10, 10])
  })

  it('getDimensions should accept a polygon array', async () => {
    expect(getDimensions([[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]])).toEqual({ width: 10, height: 10 })
  })
})
