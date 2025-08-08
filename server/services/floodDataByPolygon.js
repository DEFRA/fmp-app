const { getFloodZones } = require('./agol/getFloodZones')
const { getFloodZonesClimateChange } = require('./agol/getFloodZonesClimateChange')
const { isRiskAdminArea } = require('./riskAdmin/isRiskAdminArea')
const { getSurfaceWater } = require('./agol/getSurfaceWater')
const { PerformanceLogger } = require('./utils/performanceLogger')

const getFloodDataByPolygon = async (polygon) => {
  if (!polygon) {
    throw new Error('getFloodDataByPolygon - No Polygon provided')
  }
  try {
    const performanceLogger = new PerformanceLogger('     getFloodDataByPolygon')
    const results = {}
    await Promise.all([
      getFloodZones({ geometryType: 'esriGeometryPolygon', polygon }),
      getFloodZonesClimateChange({ geometryType: 'esriGeometryPolygon', polygon }),
      getSurfaceWater({ geometryType: 'esriGeometryPolygon', polygon }),
      isRiskAdminArea(polygon)
    ]).then((responseArray) => {
      return Object.assign(results, ...responseArray)
    })
    performanceLogger.logTime()
    console.log('\n')
    return results
  } catch (error) {
    console.log('caught getFloodDataByPolygon ERROR', error)
    throw new Error('Fetching getFloodDataByPolygon failed: ', error)
  }
}

const expiresIn = 3 // 10 minutes
const staleIn = 1 // 9 minutes
const generateTimeout = 20000 // 10 seconds
const staleTimeout = 1 // 59 seconds

module.exports = {
  name: 'getFloodDataByPolygon',
  method: getFloodDataByPolygon,
  options: {
    cache: {
      cache: 'FMFP',
      expiresIn,
      staleIn,
      generateTimeout,
      staleTimeout
    },
    generateKey: (polygon) => JSON.stringify(polygon)
  }
}
