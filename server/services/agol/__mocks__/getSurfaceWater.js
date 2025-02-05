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
      return {
        surfaceWater: { riskBandId: 3, riskBand: 'High', riskBandPercent: '3.3', riskBandOdds: '1 in 30' }
      }
    case mockPolygons.fz1_only:
    case mockPolygons.fz1_only_gt_1_ha:
    case mockPolygons.fz2_only:
    case mockPolygons.fz3_only:
    case mockPolygons.optedOut.fz1_only:
    default:
      return {
        surfaceWater: { riskBandId: -1, riskBand: false }
      }
  }
}

module.exports = { getSurfaceWater }
