const Boom = require('boom')
const config = require('../../config')
const util = require('../util')

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: async (request, h) => {
    try {
      const payload = await util.get(config.ordnanceSurvey.mapsUrl, true)
      return h.response(payload).type('text/xml')
    } catch (err) {
      return Boom.badRequest('os-get-capabilities failed')
    }
  }
}
