const { getFloodZones } = require('./agol/getFloodZones')
const { isRiskAdminArea } = require('./riskAdmin/isRiskAdminArea')

const getFloodZonesByPolygon = async (polygon) => {
  if (!polygon) {
    throw new Error('getFloodZonesByPolygon - No Polygon provided')
  }
  try {
    const results = {
      surface_water: false
    }

    await Promise.all([
      getFloodZones({ geometryType: 'esriGeometryPolygon', polygon }),
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
