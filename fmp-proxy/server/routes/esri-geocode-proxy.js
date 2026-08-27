const { createEsriProxyRoute } = require('../services/createEsriProxyRoute')

const GEOCODE_BASE = 'https://geocode-api.arcgis.com/arcgis/rest/services/'

module.exports = createEsriProxyRoute({
  path: '/proxy/esri-geocode/{path*}',
  baseUrl: new URL(GEOCODE_BASE),
  description: 'Proxy ESRI world geocoder requests while injecting short-lived AGOL token',
  logLabel: 'esri geocode'
})
