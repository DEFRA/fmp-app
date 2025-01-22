const mockPolygons = require('../../__data__/mockPolygons.json')

const getFloodZones = async (options) => {
  switch (options.polygon) {
    case mockPolygons.fz1_only:
    case mockPolygons.inRiskAdmin.fz1_only:
    case mockPolygons.inRiskAdmin.throws:
      return { floodZone: '1', floodzone_2: false, floodzone_3: false }
    case mockPolygons.fz2_only:
    case mockPolygons.inRiskAdmin.fz2_only:
      return { floodZone: '2', floodzone_2: true, floodzone_3: false }
    case mockPolygons.fz3_only:
    case mockPolygons.inRiskAdmin.fz3_only:
    case mockPolygons.optedOut.fz3_only:
      return { floodZone: '3', floodzone_2: false, floodzone_3: true }
    case mockPolygons.fz2_and_3:
    case mockPolygons.inRiskAdmin.fz2_and_3:
      return { floodZone: '3', floodzone_2: true, floodzone_3: true }
    default: {
      throw new Error(`Error - No Polygon Mocked - ${JSON.stringify(options.polygon)}`)
    }
  }
}

module.exports = { getFloodZones }
