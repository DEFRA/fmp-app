const Boom = require('@hapi/boom')
const config = require('../../config')
const { osMapsUrl, osMapsKey } = config.ordnanceSurvey
const wreck = require('@hapi/wreck').defaults({
  timeout: config.httpTimeoutMs
})
const mockData = require('../mock/address/find-by-place/PICKERING.json')

module.exports = {
  method: 'GET',
  path: '/os-maps-proxy',
  handler: async (request, h) => {
    try {
      let payload = {}
      if (config.mockAddressService) {
        payload.payload = mockData.osMapProxyPayload
      } else {
        const url = `${osMapsUrl}${request.url.search}&key=${osMapsKey}`
        payload = await wreck.get(url)
      }

      return h.response(payload.payload).type('image/png')
    } catch (err) {
      return Boom.badRequest('os-get-maps failed')
    }
  }
}
