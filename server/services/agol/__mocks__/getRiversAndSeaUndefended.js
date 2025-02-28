const mockPolygons = require('../../__data__/mockPolygons.json')

const getRiversAndSeaUndefended = async (options) => {
  switch (options.polygon) {
    case mockPolygons.fz2_low:
      return {
        riversAndSeaUndefended: { riskBandId: 1, riskBandPercent: '0.1', riskBandOdds: '1 in 1000' }
      }
    case mockPolygons.fz2_medium:
    case mockPolygons.fz3_high:
    case mockPolygons.fz1_only_lt_1_ha_rs:
      return {
        riversAndSeaUndefended: { riskBandId: 0, riskBandPercent: '1', riskBandOdds: '1 in 100' }
      }
    case mockPolygons.fz1_only:
    case mockPolygons.fz1_only_gt_1_ha:
    case mockPolygons.fz1_only_lt_1_ha_sw:
    case mockPolygons.fz1_only_lt_1_ha_rsd:
    case mockPolygons.fz1_only_lt_1_ha_rsd_cc:
    case mockPolygons.fz1_only_lt_1_ha_rs_cc:
    case mockPolygons.fz2_only:
    case mockPolygons.fz3_only:
    case mockPolygons.optedOut.fz1_only:
    default:
      return {
        riversAndSeaUndefended: { riskBandId: 2, riskBandPercent: false, riskBandOdds: false }
      }
  }
}

module.exports = { getRiversAndSeaUndefended }
