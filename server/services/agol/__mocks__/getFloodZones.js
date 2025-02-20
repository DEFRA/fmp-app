const mockPolygons = require('../../__data__/mockPolygons.json')

const getFloodZones = async (options) => {
  switch (options.polygon) {
    case mockPolygons.fz1_only:
    case mockPolygons.fz1_only_gt_1_ha:
    case mockPolygons.fz1_only_lt_1_ha_sw:
    case mockPolygons.inRiskAdmin.fz1_only:
    case mockPolygons.inRiskAdmin.throws:
    case mockPolygons.optedOut.fz1_only:
      return { floodZone: '1', floodzone_2: false, floodzone_3: false, floodZoneLevel: 'low' }
    case mockPolygons.fz2_only:
    case mockPolygons.inRiskAdmin.fz2_only:
    case mockPolygons.fz2_low:
    case mockPolygons.fz2_medium:
      return { floodZone: '2', floodzone_2: true, floodzone_3: false, floodZoneLevel: 'medium' }
    case mockPolygons.fz3_only:
    case mockPolygons.inRiskAdmin.fz3_only:
    case mockPolygons.optedOut.fz3_only:
      return { floodZone: '3', floodzone_2: false, floodzone_3: true, floodZoneLevel: 'high' }
    case mockPolygons.fz2_and_3:
    case mockPolygons.inRiskAdmin.fz2_and_3:
    case mockPolygons.fz3_high:
      return { floodZone: '3', floodzone_2: true, floodzone_3: true, floodZoneLevel: 'high' }
    default: {
      throw new Error(`Error - No Polygon Mocked - ${JSON.stringify(options.polygon)}`)
    }
  }
}

module.exports = { getFloodZones }
