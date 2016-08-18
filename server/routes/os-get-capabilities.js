var Boom = require('boom')
var config = require('../../config')
var wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})
var error = require('../models/errors.json').oSGetCapabilities

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: function (request, reply) {
    wreck.get(config.envVars.os_maps_url, function (err, response, payload) {
      if (err || response.statusCode !== 200) {
        return reply(Boom.badRequest(error.message, err))
      }
      reply(payload).type('text/xml')
    })
  }
}
