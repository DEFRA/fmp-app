const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('.')

// The ESRI requests have not been made consts as if will reduce the number of requests made.
// We first check if the area has a 1 in 30 chance of surface water flooding, if not we check for 1 in 100, 
// if not we check for 1 in 1000.
const getSurfaceWaterClimateChange = async (options) => {
  const surfaceWaterClimateChange1In30 = await esriFeatureRequest(config.agol.surfaceWaterClimateChange1In30EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
  if (surfaceWaterClimateChange1In30.length > 0) {
    // const surfaceWaterClimateChange = '1 in 30'
    return {
      surfaceWaterClimateChange: '1 in 30'
    }
  }
  const surfaceWaterClimateChange1In100 =  await esriFeatureRequest(config.agol.surfaceWaterClimateChange1In100EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
  if (surfaceWaterClimateChange1In100.length > 0) {
    // const surfaceWaterClimateChange = '1 in 100'
    return {
      surfaceWaterClimateChange: '1 in 100'
    }
  }
  const surfaceWaterClimateChange1In1000 = await esriFeatureRequest(config.agol.surfaceWaterClimateChange1In1000EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
  if (surfaceWaterClimateChange1In1000.length > 0) {
    // const surfaceWaterClimateChange = '1 in 1000'
    return {
      surfaceWaterClimateChange: '1 in 1000'
    }
  }
  return {
    surfaceWaterClimateChange: false
  }
}

module.exports = { getSurfaceWaterClimateChange }
