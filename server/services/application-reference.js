const config = require('../../config')
const url = config.service + '/reference-number'
const Wreck = require('wreck')

const getApplicationReferenceNumber = async function () {
  const { payload } = await Wreck.get(url)
  return payload.toString()
}
module.exports = { getApplicationReferenceNumber }
