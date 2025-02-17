const { config } = require('../../../config')
const { defraMap: mapConfig } = config
const { OS_ACCOUNT_NUMBER } = require('../../constants')
Object.assign(mapConfig, {
  agolServiceUrl: config.agol.serviceUrl,
  agolVectorTileUrl: config.agol.vectorTileUrl
})

module.exports = {
  method: 'GET',
  path: '/defra-map/config',
  options: {
    description: 'config values for the defra-map component',
    handler: async (request, h) => {
      return Object.assign({ OS_ACCOUNT_NUMBER }, mapConfig)
    }
  }
}
