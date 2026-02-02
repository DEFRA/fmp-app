const { config } = require('../../../config')
const { OS_ACCOUNT_NUMBER } = require('../../constants')
const { revision } = require('../../../version')

const mapConfig = {
  ...config.defraMap,
  agolServiceUrl: config.agol.serviceUrl,
  agolVectorTileUrl: config.agol.vectorTileUrl
}

// version - is used to cache-bust the info panel requests, so it is unique for each version
// or each build when run locally
const version = config.env === 'local' ? Date.now() : revision

module.exports = {
  method: 'GET',
  path: '/defra-map/config',
  options: {
    description: 'config values for the defra-map component',
    handler: async (request, h) => {
      return { ...mapConfig, OS_ACCOUNT_NUMBER, version }
    },
    tags: ['asset']
  }
}
