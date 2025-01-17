const mockPolygons = require('../../agol/__mocks__/mockPolygons.json')

const isRiskAdminArea = async (polygon) => {
  switch (polygon) {
    case mockPolygons.inRiskAdmin.fz1_only:
      return { isRiskAdminArea: true }
    case mockPolygons.inRiskAdmin.fz2_only:
      return { isRiskAdminArea: true }
    case mockPolygons.inRiskAdmin.fz3_only:
      return { isRiskAdminArea: true }
    case mockPolygons.inRiskAdmin.fz2_and_3:
      return { isRiskAdminArea: true }
    case mockPolygons.inRiskAdmin.throws: {
      throw new Error(`Error - No Riskadmin Polygon Mocked - ${polygon}`)
    }
    default: return { isRiskAdminArea: false }
  }
}

module.exports = { isRiskAdminArea }
