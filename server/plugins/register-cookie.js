const { config } = require('../../config')

exports.plugin = {
  name: 'register-cookie',
  register: (server, options) => {
    // Cookie used to store a successful p4 request to stop duplication
    server.state('p4Request', {
      ttl: null, // ttl is session
      isSecure: config.siteUrl.startsWith('https'),
      path: '/',
      isSameSite: false,
      isHttpOnly: true,
      encoding: 'base64json',
      clearInvalid: true,
      strictHeader: true
    })
  }
}
