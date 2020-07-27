const Boom = require('boom')
const config = require('../../config')
const wreck = require('@hapi/wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: async (request, h) => {
    try {
      const payload = await wreck.get(config.ordnanceSurvey.mapsUrl)
      return h.response(payload.payload.toString()).type('text/xml')
    } catch (err) {
      return Boom.badRequest('os-get-capabilities failed')
    }
  }
}
