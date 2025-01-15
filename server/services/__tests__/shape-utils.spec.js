require('dotenv').config({ path: 'config/.env-example' })
const {
  getArea,
  getAreaInHectares,
  polygonToArray,
  buffPolygon,
  polygonStartEnd
} = require('../../../server/services/shape-utils')
const zeroAreaPolygons = require('./__mocks__/zeroAreaPolygons')

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
