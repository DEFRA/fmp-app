const mockPolygons = require('../../__data__/mockPolygons.json')

const getSurfaceWater = async (options) => {
  switch (options.polygon) {
    case mockPolygons.fz2_low:
      return {
        surfaceWater: { riskBandId: 1, riskBand: 'Low', riskBandPercent: '0.1', riskBandOdds: '1 in 1000' }
      }
    case mockPolygons.fz2_medium:
      return {
        surfaceWater: { riskBandId: 2, riskBand: 'Medium', riskBandPercent: '1', riskBandOdds: '1 in 100' }
      }
    case mockPolygons.fz3_high:
    case mockPolygons.fz1_only_lt_1_ha_sw:
      return {
        surfaceWater: { riskBandId: 3, riskBand: 'High', riskBandPercent: '3.3', riskBandOdds: '1 in 30' }
      }
    case mockPolygons.fz1_only:
    case mockPolygons.fz1_only_lt_1_ha:
    case mockPolygons.fz1_only_no_la:
    case mockPolygons.fz1_only_gt_1_ha:
    case mockPolygons.fz2_only:
    case mockPolygons.fz3_only:
    case mockPolygons.optedOut.fz1_only:
    case mockPolygons.fz1_only_lt_1_ha_rsd:
    case mockPolygons.fz1_only_lt_1_ha_rsd_cc:
    case mockPolygons.fz1_only_lt_1_ha_rs:
    case mockPolygons.fz1_only_lt_1_ha_rs_cc:
    default:
      return {
        surfaceWater: { riskBandId: -1, riskBand: false }
      }
  }
}

module.exports = { getSurfaceWater }
