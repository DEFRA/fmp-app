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

const ignoreUseAutomatedService = () => {
  // This can be set to true (used on pre-prod) to force the ability
  // to download P4s even if turned off for the specific authority
  return Boolean(config.ignoreUseAutomatedService)
}

module.exports = { getPsoContacts, ignoreUseAutomatedService }
