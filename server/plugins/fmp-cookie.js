const { signToken } = require('@defra/fmp-utilities/secureUtils')
const { config } = require('../../config')

const COOKIE_NAME = 'fmp'

exports.plugin = {
  name: 'fmp-cookie',
  register: (server, _options) => {
    // The value is already a signed token, so no additional encoding is applied
    server.state(COOKIE_NAME, {
      ttl: null, // ttl is session
      isSecure: config.siteUrl.startsWith('https'),
      path: '/',
      isSameSite: 'Lax',
      isHttpOnly: true,
      encoding: 'none',
      strictHeader: true
    })

    server.ext('onPreResponse', (request, h) => {
      const statusCode = request.response.isBoom ? request.response.output.statusCode : request.response.statusCode
      if (statusCode === 404) {
        return h.continue
      }
      h.state(COOKIE_NAME, signToken({ created: Date.now() }, config.proxyPrivateKey))
      return h.continue
    })
  }
}
