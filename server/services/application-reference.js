const config = require('../../config')
const url = config.functionAppUrl + '/reference-number'
const Wreck = require('@hapi/wreck')

const getApplicationReferenceNumber = async function () {
  const { payload } = await Wreck.get(url)
  return payload.toString()
}
module.exports = { getApplicationReferenceNumber }
