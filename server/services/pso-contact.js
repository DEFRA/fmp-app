const { getContacts } = require('./agol/getContacts')

const getPsoContacts = async (easting, northing) => {
  try {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    return await getContacts({ geometryType: 'esriGeometryPoint', x: easting, y: northing })
  } catch (error) {
    console.log('pso-contact', error.message, '\n', error)
    throw new Error('Fetching Pso contacts failed: ', error)
  }
}

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

module.exports = {
  name: 'getPsoContacts',
  method: getPsoContacts,
  options: {
    cache: {
      cache: 'FMFP',
      expiresIn,
      staleIn,
      generateTimeout,
      staleTimeout
    }
  }
}
