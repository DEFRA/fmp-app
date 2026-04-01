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

  if ((results.hasRiversSource && results.hasSeaSource) || results.hasRiversAndSeaSource) {
    results.hasRiversAndSeaSource = true
  }
  results.floodSource = (results.hasRiversSource && results.hasSeaSource) || results.hasRiversAndSeaSource
    ? 'rivers and the sea'
    : results.hasRiversSource
      ? 'rivers'
      : results.hasSeaSource
        ? 'the sea'
        : null
  return results
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
