const glupe = require('glupe')
const config = require('./config')
const { manifest, options } = require('./server')

;(async () => {
  try {
    const server = await glupe(manifest, options)

    if (config.mockAddressService) {
      // Mock Address service
      require('./server/mock/address')
      server.log('info', 'Address service requests are being mocked')
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
