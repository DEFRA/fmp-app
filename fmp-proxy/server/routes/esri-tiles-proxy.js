const { config } = require('../config')
const { createEsriProxyRoute } = require('../services/createEsriProxyRoute')

module.exports = createEsriProxyRoute({
  path: '/proxy/esri-tiles/{path*}',
  baseUrl: new URL(config.agol.vectorTileUrl),
  description: 'Proxy ESRI vector tile requests while injecting short-lived AGOL token',
  logLabel: 'esri tiles'
})
