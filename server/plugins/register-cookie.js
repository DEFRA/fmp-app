const config = require('../../config')

exports.plugin = {
  name: 'register-cookie',
  register: (server, options) => {
    // Cookie used to notify the client
    // browser that the download is complete
    server.state('pdf-download', {
      ttl: 10000,
      isSecure: config.siteUrl.startsWith('https'),
      path: '/',
      isSameSite: false,
      isHttpOnly: true,
      encoding: 'none',
      clearInvalid: true,
      strictHeader: true
    })
    server.state('snd', {
      ttl: null,
      isSecure: config.siteUrl.startsWith('https'),
      isHttpOnly: false,
      encoding: 'none',
      clearInvalid: false,
      strictHeader: true
    })
  }
}
