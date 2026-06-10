const { getFloodZones } = require('./agol/getFloodZones')
const { getFloodZonesClimateChange } = require('./agol/getFloodZonesClimateChange')
const { isRiskAdminArea } = require('./riskAdmin/isRiskAdminArea')
const { getSurfaceWater } = require('./agol/getSurfaceWater')
const { getSurfaceWaterClimateChange } = require('./agol/getSurfaceWaterClimateChange')

const getFloodDataByPolygon = async (polygon) => {
  if (!polygon) {
    throw new Error('getFloodDataByPolygon - No Polygon provided')
  }
  try {
    const results = {}
    await Promise.all([
      getFloodZones({ geometryType: 'esriGeometryPolygon', polygon }),
      getFloodZonesClimateChange({ geometryType: 'esriGeometryPolygon', polygon }),
      getSurfaceWater({ geometryType: 'esriGeometryPolygon', polygon }),
      getSurfaceWaterClimateChange({ geometryType: 'esriGeometryPolygon', polygon }),
      isRiskAdminArea(polygon)
    ]).then(([floodZonesData, floodZonesCCData, surfaceWaterData, surfaceWaterClimateChangeData, riskAdminData]) => {
      return Object.assign(results, {
        ...floodZonesData,
        ...floodZonesCCData,
        ...surfaceWaterData,
        ...surfaceWaterClimateChangeData,
        ...riskAdminData,
        hasRiversSource: floodZonesData.hasRiversSource || floodZonesCCData.hasRiversSource,
        hasSeaSource: floodZonesData.hasSeaSource || floodZonesCCData.hasSeaSource
      })
    })
    return results
  } catch (error) {
    console.log('caught getFloodDataByPolygon ERROR', error)
    throw new Error('Fetching getFloodDataByPolygon failed: ', error)
  }
}

module.exports = { getFloodDataByPolygon }
