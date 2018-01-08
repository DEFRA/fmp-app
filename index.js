'use strict'
const config = require('./config')
const pkg = require('./package.json')
const appName = pkg.name
const appVersion = pkg.version
const composeServer = require('./server')

if (!module.parent) {
  (async () => {
    try {
      const server = await require('./server')()
      // Start the server
      const details = {
        name: appName,
        version: appVersion,
        info: server.info
      }
      await server.start()
      server.log(['info'], 'Server started: ' + JSON.stringify(details))
      if (config.mockAddressService) {
        // Mock Address service
        require('./server/mock/address')
        server.log('info', 'Address service requests are being mocked')
      }
    } catch (err) {
      throw err
    }
  })()
} else {
  module.exports = composeServer
}
