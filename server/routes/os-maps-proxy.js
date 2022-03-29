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
      // Mocking Os-maps for Performance Jmeter tests
      // const url = `${osMapsUrl}${request.url.search}&key=${osMapsKey}`
      // const payload = await wreck.get(url)
      const payload = {
        payload: '/assets/images/marker.png'
      }

      return h.response(payload.payload).type('image/png')
    } catch (err) {
      return Boom.badRequest('os-get-maps failed')
    }
  }
}
