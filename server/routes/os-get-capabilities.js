const Boom = require('boom')
const config = require('../../config')
const { osMapsUrl, osMapsKey, osGetCapabilitiesUrl } = config.ordnanceSurvey
const wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: async (request, h) => {
    try {
      const url = `${osMapsUrl}?key=${osMapsKey}&${osGetCapabilitiesUrl}`
      let payload = await wreck.get(url)
      // replace secret key in capabilities
      const regex = new RegExp(osMapsKey, 'g')
      payload.payload = payload.payload.toString().replace(regex, '***')
      return h.response(payload.payload.toString()).type('text/xml')
    } catch (err) {
      return Boom.badRequest('os-get-capabilities failed')
    }
  }
}
