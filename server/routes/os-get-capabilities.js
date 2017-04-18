var Boom = require('boom')
var config = require('../../config')
var wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: function (request, reply) {
    wreck.get(config.ordnanceSurvey.mapsUrl, function (err, response, payload) {
      if (err || response.statusCode !== 200) {
        return reply(Boom.badRequest('Ordnance survey getcapabilities failed', err))
      }
      reply(payload).type('text/xml')
    })
  }
}
