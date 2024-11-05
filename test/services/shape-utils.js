const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const {
  getArea,
  getAreaInHectares,
  polygonToArray,
  buffPolygon,
  polygonStartEnd,
  getExtents
} = require('../../server/services/shape-utils')
const zeroAreaPolygons = require('./zeroAreaPolygons')

lab.experiment('shape-utils - polygonToArray', () => {
  lab.test('polygonToArray should return an array for polygon strings "[[0,0],[0,10],[10,10],[10,0]]"', async () => {
    const polygonString = '[[0,0],[0,10],[10,10],[10,0]]'
    Code.expect(polygonToArray(polygonString)).to.equal([
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0]
    ])
  })

  lab.test('polygonToArray should return an array for polygon array [[0,0],[0,10],[10,10],[10,0]]', async () => {
    const polygonString = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0]
    ]
    Code.expect(polygonToArray(polygonString)).to.equal([
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0]
    ])
  })
})

const polygonsToTest = [
  /* [polygonString, area in m^2 (Number), 'Hectares (String to 2 dp), extents - [width, height]] */
  [undefined, undefined, undefined, undefined],
  ['', undefined, undefined, undefined],
  ['[]', 0, '0', [undefined, undefined]],
  ['[[10,10]]', 0, '0', [0, 0]], // Point has 0 area
  ['[[10,10],[20,20]]', 0, '0', [10, 10]], // Line has 0 area
  ['[[0,0],[0,10],[10,0]]', 50, '0.01', [10, 10]], // Triangle
  ['[[866,0],[1866,0],[2732,500],[2732,1500],[1866,2000],[866,2000],[0,1500],[0,500]]', 4598000, '459.8', [2732, 2000]], // Irregular Hexagon
  ['[[0,0],[0,10],[10,10],[10,0]]', 100, '0.01', [10, 10]], // Square
  ['[[0,0],[0,10],[15,10],[15,5],[10,5],[10,0]]', 125, '0.01', [15, 10]], // 2 Squares butted together (one of 1/2 size of the other)
  ['[[100,0],[100,100],[250,100],[250,50],[200,50],[200,0]]', 12500, '1.25', [150, 100]] // 2 offset Squares butted together (one of 1/2 size of the other)
]

lab.experiment('shape-utils - getArea/getAreaInHectares', () => {
  polygonsToTest.forEach(([polygonString, expectedSqMeters, expectedHectares]) => {
    lab.test(`getArea should return ${expectedSqMeters} for ${polygonString}`, async () => {
      Code.expect(getArea(polygonString)).to.equal(expectedSqMeters)
    })

    lab.test(`getAreaInHectares should return ${expectedHectares} for ${polygonString}`, async () => {
      Code.expect(getAreaInHectares(polygonString)).to.equal(expectedHectares)
    })
    // Now repeat the same tests, but with polygon as an array instead of a string
    const polygon = polygonString ? JSON.parse(polygonString) : undefined
    lab.test(`getArea should return ${expectedSqMeters} for ${polygonString} when it is an array`, async () => {
      Code.expect(getArea(polygon)).to.equal(expectedSqMeters)
    })

    lab.test(
      `getAreaInHectares should return ${expectedHectares} for ${polygonString} when it is an array`,
      async () => {
        Code.expect(getAreaInHectares(polygon)).to.equal(expectedHectares)
      }
    )
  })

  zeroAreaPolygons.forEach(([zeroAreaPolygon, expectedBuffedPolygon, expectedMinMaxXY]) => {
    lab.test(
      `polygonStartEnd for ${JSON.stringify(zeroAreaPolygon)} should return ${JSON.stringify(expectedMinMaxXY)}`,
      async () => {
        Code.expect(polygonStartEnd(zeroAreaPolygon)).to.equal(expectedMinMaxXY)
      }
    )

    lab.test(
      `buffPolygon should convert ${JSON.stringify(zeroAreaPolygon)} to ${JSON.stringify(expectedBuffedPolygon)}`,
      async () => {
        Code.expect(buffPolygon(zeroAreaPolygon)).to.equal(expectedBuffedPolygon)
      }
    )
  })
})

lab.experiment('shape-utils = getExtents', () => {
  polygonsToTest.forEach(([polygonString, _expectedSqMeters, _expectedHectares, expectedExtents]) => {
    // const polygon = polygonString ? JSON.parse(polygonString) : undefined
    const [expectedWidth, expectedHeight] = expectedExtents || [undefined, undefined]
    lab.test.only(`getExtents(${polygonString}) should return {width: ${expectedWidth}, height: ${expectedHeight}}`,
      async () => {
        Code.expect(getExtents(polygonString)).to.equal({ width: expectedWidth, height: expectedHeight })
      }
    )
  })
})
