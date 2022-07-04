const config = require('../../config')
const Wreck = require('@hapi/wreck')
const url = config.functionAppUrl + '/pso/contacts'

async function getPsoContacts (easting, northing) {
  try {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    const data = JSON.stringify({ x: easting, y: northing })
    const { payload } = await Wreck.post(url, {
      payload: data
    })
    return JSON.parse(payload.toString())
  } catch (error) {
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
      cache: 'FMFP', expiresIn, staleIn, generateTimeout, staleTimeout
    }
  }
}
