const config = require('../../config')
const Wreck = require('@hapi/wreck')
const url = config.functionAppUrl + '/email/confirmation'

async function emailConfirmation (model) {
  const { fullname, referencenumber, areaname, psoemailaddress, recipientemail, location, search, zoneNumber } = model
  try {
    if (!location) {
      throw new Error('No point provided')
    }
    const emailObj = {
      fullname,
      referencenumber,
      areaname,
      psoemailaddress,
      recipientemail,
      location,
      search,
      zoneNumber
    }
    const data = JSON.stringify(emailObj)
    await Wreck.post(url, {
      payload: data
    })
  } catch (error) {
    throw new Error('Failed to send email', error)
  }
}
module.exports = { emailConfirmation }
