const config = require('../../config')
const Wreck = require('wreck')
const url = config.functionAppUrl + '/pso/contacts'

async function getPsoContacts (easting, northing) {
  try {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    const { payload } = await Wreck.get(url + '/' + easting + '/' + northing)
    return JSON.parse(payload.toString())
  } catch (error) {
    throw new Error('Fetching Pso contacts failed: ', error)
  }
}
module.exports = { getPsoContacts }
