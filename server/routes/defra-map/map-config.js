const { config } = require('../../../config')
const { OS_ACCOUNT_NUMBER } = require('../../constants')
const { revision } = require('../../../version')
const { getHostAndProtocol } = require('../../services/getHostAndProtocol')

const { fmpProxyUrl } = config

// version - is used to cache-bust the info panel requests, so it is unique for each version
// or each build when run locally
const version = config.env === 'local' ? Date.now() : revision

module.exports = {
  method: 'GET',
  path: '/defra-map/config',
  options: {
    description: 'config values for the defra-map component',
    handler: async (request, h) => {
      const origin = getHostAndProtocol(request)
      const proxyUrl = fmpProxyUrl || `${origin}/proxy`

      return {
        ...config.defraMap,
        agolServiceUrl: `${proxyUrl}/esri-service`,
        agolVectorTileUrl: `${proxyUrl}/esri-tiles`,
        fmpProxyUrl: proxyUrl,
        OS_ACCOUNT_NUMBER,
        version

      }
    },
    tags: ['asset']
  }
}
