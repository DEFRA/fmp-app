const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('.')

// We first check if the area has a 1 in 30 chance of surface water flooding, if not we check for 1 in 100,
// if not we check for 1 in 1000.
const getSurfaceWater = async (options) => {
  const surfaceWater1In30 = await esriFeatureRequest(config.agol.surfaceWater1In30EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
  if (surfaceWater1In30.length > 0) {
    return {
      surfaceWater: {
        riskBandPercent: '3.3',
        riskBandOdds: '1 in 30'
      }
    }
  }
  const surfaceWater1In100 = await esriFeatureRequest(config.agol.surfaceWater1In100EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
  if (surfaceWater1In100.length > 0) {
    return {
      surfaceWater: {
        riskBandPercent: '1',
        riskBandOdds: '1 in 100'
      }
    }
  }
  const surfaceWater1In1000 = await esriFeatureRequest(config.agol.surfaceWater1In1000EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
  if (surfaceWater1In1000.length > 0) {
    return {
      surfaceWater: {
        riskBandPercent: '0.1',
        riskBandOdds: '1 in 1000'
      }
    }
  }
  return {
    surfaceWater: false
  }
}

module.exports = { getSurfaceWater }
