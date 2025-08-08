const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('.')
const { PerformanceLogger } = require('../utils/performanceLogger')

const assignFloodZoneResponse = (response, results) => {
  for (const { attributes } of response) {
    results.floodZoneClimateChange = results.floodZoneClimateChange || (attributes.Name === 'Flood Zones plus climate change')
    results.floodZoneClimateChangeNoData = results.floodZoneClimateChangeNoData || (attributes.Name === 'Unavailable')
    if (results.floodZoneClimateChange && results.floodZoneClimateChangeNoData) {
      break // We can stop early once we find true
    }
  }
  return results
}

const getFloodZonesClimateChange = async (options) => {
  const performanceLogger = new PerformanceLogger('getFloodZonesClimateChange')
  const results = {
    floodZoneClimateChange: false,
    floodZoneClimateChangeNoData: false
  }
  const result = await esriFeatureRequest(config.agol.floodZonesClimateChangeEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignFloodZoneResponse(esriResponse, results))
  performanceLogger.logTime()
  return result
}

module.exports = { getFloodZonesClimateChange }
