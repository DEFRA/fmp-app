const { getContacts } = require('./agol/getContacts')
const { PerformanceLogger } = require('./utils/performanceLogger')

const getPsoContactsByPolygon = async (polygon) => {
  try {
    const performanceLogger = new PerformanceLogger('     getPsoContactsByPolygon')
    const results = await getContacts({ geometryType: 'esriGeometryPolygon', polygon })
    performanceLogger.logTime()
    return results
  } catch (error) {
    console.log('Fetching Pso contacts by polygon failed: ', error)
    throw new Error('Fetching Pso contacts by polygon failed: ', error)
  }
}

const expiresIn = 3 // 10 minutes
const staleIn = 1 // 9 minutes
const generateTimeout = 20000 // 10 seconds
const staleTimeout = 1 // 59 seconds

module.exports = {
  name: 'getPsoContactsByPolygon',
  method: getPsoContactsByPolygon,
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
