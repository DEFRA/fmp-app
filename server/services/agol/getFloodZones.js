const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('./')

const assignFloodZoneResponse = (response, results) => {
  for (const { attributes } of response) {
    results.floodzone_2 = results.floodzone_2 || (attributes.flood_zone === 'FZ2')
    results.floodzone_3 = results.floodzone_3 || (attributes.flood_zone === 'FZ3')
    results.hasRiverSource = results.hasRiverSource || attributes.flood_source === 'river'
    results.hasSeaSource = results.hasSeaSource || attributes.flood_source === 'sea'
    if (results.floodzone_2 && results.floodzone_3 && results.hasRiverSource && results.hasSeaSource) {
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

  if (results.hasRiverSource && results.hasSeaSource) {
    results.hasRiversAndSeaSource = 'river and sea'
  }
  results.floodSource = results.hasRiverSource && results.hasSeaSource
    ? 'rivers and the sea' : results.hasRiverSource
      ? 'rivers' : results.hasSeaSource
        ? 'the sea' : null
  console.log('AGOL flood zone results', results)
  return results
}

const getFloodZones = async (options) => {
  const results = {
    floodzone_2: false,
    floodzone_3: false,
    hasSeaSource: false,
    hasRiverSource: false,
    floodSource: null,
  }

  return esriFeatureRequest(config.agol.floodZonesRiversAndSeaEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignFloodZoneResponse(esriResponse, results))
}

module.exports = { getFloodZones }
