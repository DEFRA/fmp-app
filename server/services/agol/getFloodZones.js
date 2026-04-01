const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('./')

const assignFloodZoneResponse = (response, results) => {
  for (const { attributes } of response) {
    results.floodzone_2 = results.floodzone_2 || (attributes.flood_zone === 'FZ2')
    results.floodzone_3 = results.floodzone_3 || (attributes.flood_zone === 'FZ3')
    results.hasRiversSource = results.hasRiversSource || attributes.flood_source === 'river'
    results.hasSeaSource = results.hasSeaSource || attributes.flood_source === 'sea'
    results.hasRiversAndSeaSource = results.hasRiversAndSeaSource || attributes.flood_source === 'river and sea'
    if ((results.floodzone_2 && results.floodzone_3) && ((results.hasRiversSource && results.hasSeaSource) || results.hasRiversAndSeaSource)) {
      break // We can stop early once we find FZs 2, 3, river and sea sources
    }
  }
  const zone = results.floodzone_3 ? '3' : results.floodzone_2 ? '2' : '1'
  results.floodZone = zone
  results.floodZoneLevel = getFloodZonesLevels(results.floodzone_2, results.floodzone_3)

  if ((results.hasRiversSource && results.hasSeaSource) || results.hasRiversAndSeaSource) {
    results.hasRiversAndSeaSource = true
  }
  results.floodSource = getFloodSource(results)
  return results
}

const getFloodZonesLevels = (floodzone2, floodzone3) => {
  if (floodzone3) {
    return 'high'
  }
  if (floodzone2) {
    return 'medium'
  }
  return 'low'
}

const getFloodSource = ({ hasRiversSource, hasSeaSource, hasRiversAndSeaSource }) => {
  if (hasRiversAndSeaSource || (hasRiversSource && hasSeaSource)) {
    return 'rivers and the sea'
  }
  if (hasRiversSource) {
    return 'rivers'
  }
  if (hasSeaSource) {
    return 'the sea'
  }
  return null
}

const getFloodZones = async (options) => {
  const results = {
    floodzone_2: false,
    floodzone_3: false,
    hasSeaSource: false,
    hasRiversSource: false,
    hasRiversAndSeaSource: false,
    floodSource: null,
  }

  return esriFeatureRequest(config.agol.floodZonesRiversAndSeaEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignFloodZoneResponse(esriResponse, results))
}

module.exports = { getFloodZones }
