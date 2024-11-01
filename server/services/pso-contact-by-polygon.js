const { getContacts } = require('./agol/getContacts')

const getPsoContactsByPolygon = async (polygon) => {
  try {
    return await getContacts({ geometryType: 'esriGeometryPolygon', polygon })
  } catch (error) {
    throw new Error('Fetching Pso contacts by polygon failed: ', error)
  }
}

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

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
