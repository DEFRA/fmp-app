const { getCentreOfPolygon } = require('../shape-utils')
const getCentreOfPolygonData = require('./__data__/getCentreOfPolygonData.json')

describe('getCentreOfPolygon', () => {
  getCentreOfPolygonData.forEach(({ polygon, expectedCentre }) => {
    it(`should return ${JSON.stringify(expectedCentre)} for ${JSON.stringify(polygon)}`, async () => {
      expect(getCentreOfPolygon(polygon)).toEqual(expectedCentre)
    })
  })
})
