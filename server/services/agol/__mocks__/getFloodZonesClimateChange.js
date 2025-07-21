const mockPolygons = require('../../__data__/mockPolygons.json')

const both = { floodZoneClimateChange: true, floodZoneClimateChangeNoData: true }
const noDataOnly = { floodZoneClimateChange: false, floodZoneClimateChangeNoData: true }
const climateChangeOnly = { floodZoneClimateChange: true, floodZoneClimateChangeNoData: false }
const neither = { floodZoneClimateChange: false, floodZoneClimateChangeNoData: false }

const getFloodZonesClimateChange = async (options) => {
  switch (options.polygon) {
    case mockPolygons.fz1_only:
    case mockPolygons.fz1_only_no_la:
    case mockPolygons.fz1_only_gt_1_ha:
    case mockPolygons.fz1_only_lt_1_ha_sw:
    case mockPolygons.fz1_only_lt_1_ha_rsd:
    case mockPolygons.fz1_only_lt_1_ha_rsd_cc:
    case mockPolygons.fz1_only_lt_1_ha_rs:
    case mockPolygons.fz1_only_lt_1_ha_rs_cc:
    case mockPolygons.inRiskAdmin.fz1_only:
    case mockPolygons.inRiskAdmin.throws:
    case mockPolygons.optedOut.fz1_only:
      return both
    case mockPolygons.fz2_only:
    case mockPolygons.inRiskAdmin.fz2_only:
    case mockPolygons.fz2_low:
    case mockPolygons.fz2_medium:
      return noDataOnly
    case mockPolygons.fz3_only:
    case mockPolygons.inRiskAdmin.fz3_only:
    case mockPolygons.optedOut.fz3_only:
      return climateChangeOnly
    case mockPolygons.fz2_and_3:
    case mockPolygons.inRiskAdmin.fz2_and_3:
    case mockPolygons.fz3_high:
      return neither
    default: {
      throw new Error(`Error - No Polygon Mocked - ${JSON.stringify(options.polygon)}`)
    }
  }
}

module.exports = { getFloodZonesClimateChange }
