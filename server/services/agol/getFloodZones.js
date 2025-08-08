const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('./')
const { PerformanceLogger } = require('../utils/performanceLogger')

const assignFloodZoneResponse = (response, results) => {
  for (const { attributes } of response) {
    results.floodzone_2 = results.floodzone_2 || (attributes.flood_zone === 'FZ2')
    results.floodzone_3 = results.floodzone_3 || (attributes.flood_zone === 'FZ3')
    if (results.floodzone_2 && results.floodzone_3) {
      break // We can stop early once we find FZs 2 and 3
    }
  }
  if (results.floodzone_3) {
    results.floodZone = '3'
    results.floodZoneLevel = 'high'
  } else if (results.floodzone_2) {
    results.floodZone = '2'
    results.floodZoneLevel = 'medium'
  } else {
    results.floodZone = '1'
    results.floodZoneLevel = 'low'
  }
  return results
}

const getFloodZones = async (options) => {
  const performanceLogger = new PerformanceLogger('             getFloodZones')
  const results = {
    floodzone_2: false,
    floodzone_3: false
  }

  const result = await esriFeatureRequest(config.agol.floodZonesRiversAndSeaEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignFloodZoneResponse(esriResponse, results))
  performanceLogger.logTime()
  return result
}

module.exports = { getFloodZones }
