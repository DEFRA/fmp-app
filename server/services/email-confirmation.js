const config = require('../../config')
const Wreck = require('wreck')
const url = config.functionAppUrl + '/email/confirmation'

async function emailConfirmation (fullname, referencenumber, location, areaname, psoemailaddress, recipientemail, search) {
  try {
    if (!location) {
      throw new Error('No point provided')
    }
    const data = JSON.stringify({ fullname: fullname, referencenumber: referencenumber, areaname: areaname, psoemailaddress: psoemailaddress, recipientemail: recipientemail, location: location, search: search })
    await Wreck.post(url, {
      payload: data
    })
  } catch (error) {
    throw new Error('Failed to send email', error)
  }
}
module.exports = { emailConfirmation }
