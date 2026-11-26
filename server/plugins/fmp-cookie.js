const { signToken } = require('@defra/fmp-utilities/secureUtils')
const { config } = require('../../config')
const { statusCodes } = require('../constants')

const COOKIE_NAME = 'fmp'
// Health checks are unauthenticated and hit by anything, so they must not hand out the proxy cookie
const NO_COOKIE_PATHS = new Set(['/health-check', '/healthcheck'])

exports.plugin = {
  name: 'fmp-cookie',
  register: (server, _options) => {
    // The value is already a signed token, so no additional encoding is applied
    server.state(COOKIE_NAME, {
      ttl: null, // ttl is session
      isSecure: config.siteUrl.startsWith('https'),
      path: '/proxy',
      isSameSite: 'Strict',
      isHttpOnly: true,
      encoding: 'none',
      strictHeader: true
    })

    server.ext('onPreResponse', (request, h) => {
      const statusCode = request.response.isBoom ? request.response.output.statusCode : request.response.statusCode
      if (statusCode === statusCodes.PAGE_NOT_FOUND || NO_COOKIE_PATHS.has(request.path)) {
        return h.continue
      }
      h.state(COOKIE_NAME, signToken({ created: Date.now() }, config.proxyPrivateKey))
      return h.continue
    })
  }
}
