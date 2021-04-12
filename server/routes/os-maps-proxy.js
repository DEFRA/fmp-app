const Boom = require('boom')
const config = require('../../config')
const { osMapsUrl, osMapsKey } = config.ordnanceSurvey
const wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  method: 'GET',
  path: '/os-maps-proxy',
  handler: async (request, h) => {
    try {
      const url = `${osMapsUrl}${request.url.search}&key=${osMapsKey}`
      const payload = await wreck.get(url)
      return h.response(payload.payload).type('application/octect-stream')
    } catch (err) {
      return Boom.badRequest('os-get-maps failed')
    }
  }
}
