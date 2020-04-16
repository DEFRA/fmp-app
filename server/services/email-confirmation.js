const config = require('../../config')
const Wreck = require('wreck')
const url = config.functionAppUrl + '/email/confirmation'

async function emailConfirmation (fullname, referencenumber, easting, northing, areaname, emailaddress, receipentemail) {
  try {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    const data = JSON.stringify({ fullname: fullname, referencenumber: referencenumber, areaname: areaname, emailaddress: emailaddress, receipentemail: receipentemail, x: easting, y: northing })
    await Wreck.post(url, {
      payload: data
    })
  } catch (error) {
    throw new Error('Failed to send email', error)
  }
}
module.exports = { emailConfirmation }
