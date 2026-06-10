const { config } = require('../../../config')
const { formatFloodSource, assignFloodSource } = require('../floodDataFunctions')
const { esriFeatureRequest, makePolygonGeometry } = require('.')

const assignFloodZoneResponse = (response, results) => {
  for (const { attributes } of response) {
    results.floodZoneClimateChange = results.floodZoneClimateChange || (attributes.Name === 'Flood Zones plus climate change')
    results.floodZoneClimateChangeNoData = results.floodZoneClimateChangeNoData || (attributes.Name === 'Unavailable')
    assignFloodSource(attributes, results)
    if (results.floodZoneClimateChange && results.floodZoneClimateChangeNoData && results.hasRiversSource && results.hasSeaSource) {
      break // We can stop early once we find true
    }
  }
  results.floodSource = formatFloodSource(results.hasRiversSource, results.hasSeaSource)
  return results
}

const getFloodZonesClimateChange = async (options) => {
  const results = {
    floodZoneClimateChange: false,
    floodZoneClimateChangeNoData: false,
    hasRiversSource: false,
    hasSeaSource: false,
    floodSource: null
  }
  return esriFeatureRequest(config.agol.floodZonesClimateChangeEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignFloodZoneResponse(esriResponse, results))
}

module.exports = { getFloodZonesClimateChange }
