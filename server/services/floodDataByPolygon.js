const { getFloodZones } = require('./agol/getFloodZones')
const { getFloodZonesClimateChange } = require('./agol/getFloodZonesClimateChange')
const { isRiskAdminArea } = require('./riskAdmin/isRiskAdminArea')
const { getSurfaceWater } = require('./agol/getSurfaceWater')

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
      isRiskAdminArea(polygon)
    ]).then((responseArray) => {
      return Object.assign(results, ...responseArray)
    })
    return results
  } catch (error) {
    console.log('caught getFloodDataByPolygon ERROR', error)
    throw new Error('Fetching getFloodDataByPolygon failed: ', error)
  }
}

module.exports = { getFloodDataByPolygon }
