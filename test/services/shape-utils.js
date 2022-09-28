const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const { getArea, getAreaInHectares, polygonStringToArray } = require('../../server/services/shape-utils')

lab.experiment('shape-utils - polygonStringToArray', () => {
  lab.test('polygonStringToArray should an array for polygon [[0,0],[0,10],[10,10],[10,0]]', async () => {
    const polygonString = '[[0,0],[0,10],[10,10],[10,0]]'
    Code.expect(polygonStringToArray(polygonString)).to.equal([[0, 0], [0, 10], [10, 10], [10, 0]])
  })
})

lab.experiment('shape-utils - getArea/getAreaInHectares', () => {
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
    lab.test(`getArea should return ${expectedSqMeters} for ${polygonString}`, async () => {
      Code.expect(getArea(polygonString)).to.equal(expectedSqMeters)
    })

    lab.test(`getAreaInHectares should return ${expectedHectares} for ${polygonString}`, async () => {
      Code.expect(getAreaInHectares(polygonString)).to.equal(expectedHectares)
    })
  })
})
