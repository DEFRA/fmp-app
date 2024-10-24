const Boom = require('@hapi/boom')
const { config } = require('../../config')
const { osMapsUrl, osMapsKey, osGetCapabilitiesUrl } = config.ordnanceSurvey
const mockData = require('../mock/address/find-by-place/PICKERING.json')
const wreck = require('@hapi/wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  method: 'GET',
  path: '/os-get-capabilities',
  handler: async (request, h) => {
    try {
      let payload = {}
      if (config.mockAddressService) {
        console.log('enter os mock capabilities')
        payload.payload = mockData.osCapabilitiesPayload
      } else {
        const url = `${osMapsUrl}?key=${osMapsKey}&${osGetCapabilitiesUrl}`
        payload = await wreck.get(url)
      }

      // replace secret key in capabilities
      const regex = new RegExp(osMapsKey, 'g')
      payload.payload = payload.payload.toString().replace(regex, '***')
      return h.response(payload.payload.toString()).type('text/xml')
    } catch (err) {
      return Boom.badRequest('os-get-capabilities failed')
    }
  }
}
