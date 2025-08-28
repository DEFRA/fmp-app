const mockPolygons = require('../../__data__/mockPolygons.json')

const getRiversAndSeaDefendedCC = async (options) => {
  switch (options.polygon) {
    case mockPolygons.fz2_low:
      return {
        riversAndSeaDefendedCC: { riskBandId: 2, riskBandPercent: '0.1', riskBandOdds: '1 in 1000' }
      }
    case mockPolygons.fz2_medium:
      return {
        riversAndSeaDefendedCC: { riskBandId: 1, riskBandPercent: '1', riskBandOdds: '1 in 100' }
      }
    case mockPolygons.fz3_high:
    case mockPolygons.fz1_only_lt_1_ha_rsd_cc:
      return {
        riversAndSeaDefendedCC: { riskBandId: 0, riskBandPercent: '3.3', riskBandOdds: '1 in 30' }
      }
    case mockPolygons.fz1_only:
    case mockPolygons.fz1_only_lt_1_ha:
    case mockPolygons.fz1_only_no_la:
    case mockPolygons.fz1_only_gt_1_ha:
    case mockPolygons.fz1_only_lt_1_ha_sw:
    case mockPolygons.fz1_only_lt_1_ha_rsd:
    case mockPolygons.fz1_only_lt_1_ha_rs:
    case mockPolygons.fz1_only_lt_1_ha_rs_cc:
    case mockPolygons.fz2_only:
    case mockPolygons.fz3_only:
    case mockPolygons.optedOut.fz1_only:
    default:
      return {
        riversAndSeaDefendedCC: { riskBandId: 3, riskBandPercent: false, riskBandOdds: false }
      }
  }
}

module.exports = { getRiversAndSeaDefendedCC }
