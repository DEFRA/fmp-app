const { getFloodZones } = require('./agol/getFloodZones')
const { isRiskAdminArea } = require('./riskAdmin/isRiskAdminArea')
const { getRiversAndSeaDefended } = require('./agol/getRiversAndSeaDefended')
const { getRiversAndSeaUndefended } = require('./agol/getRiversAndSeaUndefended')
const { getRiversAndSeaDefendedCC } = require('./agol/getRiversAndSeaDefendedCC')
const { getRiversAndSeaUndefendedCC } = require('./agol/getRiversAndSeaUndefendedCC')
const { getSurfaceWater } = require('./agol/getSurfaceWater')

const getFloodDataByPolygon = async (polygon) => {
  if (!polygon) {
    throw new Error('getFloodDataByPolygon - No Polygon provided')
  }
  try {
    const results = {}

    await Promise.all([
      getFloodZones({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaDefended({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaUndefended({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaDefendedCC({ geometryType: 'esriGeometryPolygon', polygon }),
      getRiversAndSeaUndefendedCC({ geometryType: 'esriGeometryPolygon', polygon }),
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

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

module.exports = {
  name: 'getFloodDataByPolygon',
  method: getFloodDataByPolygon
  // options: {
  //   cache: {
  //     cache: 'FMFP',
  //     expiresIn,
  //     staleIn,
  //     generateTimeout,
  //     staleTimeout
  //   },
  //   generateKey: (polygon) => JSON.stringify(polygon)
  // }
}
