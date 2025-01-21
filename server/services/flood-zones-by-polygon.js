const { getFloodZones } = require('./agol/getFloodZones')
const { isRiskAdminArea } = require('./riskAdmin/isRiskAdminArea')
const { getRiversAndSeaDefended } = require('./agol/getRiversAndSeaDefended')
const { getRiversAndSeaUndefended } = require('./agol/getRiversAndSeaUndefended')
const { getRiversAndSeaDefendedClimateChange } = require('./agol/getRiversAndSeaDefendedClimateChange')
const { getRiversAndSeaUndefendedClimateChange } = require('./agol/getRiversAndSeaUndefendedClimateChange')
const { getSurfaceWater } = require('./agol/getSurfaceWater')

const getFloodZonesByPolygon = async (polygon) => {
  if (!polygon) {
    throw new Error('getFloodZonesByPolygon - No Polygon provided')
  }
  try {
    const results = {}

    await Promise.all([
      getFloodZones({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaDefended({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaUndefended({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaDefendedClimateChange({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaUndefendedClimateChange({ geometryType: 'esriGeometryPolygon', polygon }),
      getSurfaceWater({ geometryType: 'esriGeometryPolygon', polygon }),
      isRiskAdminArea(polygon)
    ]).then((responseArray) => {
      return Object.assign(results, ...responseArray)
    })
    return results
  } catch (error) {
    console.log('caught getFloodZonesByPolygon ERROR', error)
    throw new Error('Fetching getFloodZonesByPolygon failed: ', error)
  }
}

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

module.exports = {
  name: 'getFloodZonesByPolygon',
  method: getFloodZonesByPolygon,
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
