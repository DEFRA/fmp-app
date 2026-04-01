const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('./')

const isFz2 = (attribute) => attribute.flood_zone === 'FZ2'
const isFz3 = (attribute) => attribute.flood_zone === 'FZ3'
const isRiver = (attribute) => attribute.flood_source === 'river'
const isSea = (attribute) => attribute.flood_source === 'sea'
const isRiverAndSea = (attribute) => attribute.flood_source === 'river and sea'

const shouldBreak = (response) =>
  response.floodzone_2 &&
  response.floodzone_3 &&
  (response.hasRiversAndSeaSource || (response.hasRiversSource && response.hasSeaSource))

const assignFloodZoneResponse = (response, results) => {
  assignFloodAttributesFromFeatures(response, results)
  let zone
  if (results.floodzone_3) {
    zone = '3'
  } else if (results.floodzone_2) {
    zone = '2'
  } else { zone = '1' }
  results.floodZone = zone
  results.floodZoneLevel = getFloodZonesLevels(results.floodzone_2, results.floodzone_3)

  if ((results.hasRiversSource && results.hasSeaSource) || results.hasRiversAndSeaSource) {
    results.hasRiversAndSeaSource = true
  }
  results.floodSource = getFloodSource(results)
  return results
}

const assignFloodAttributesFromFeatures = (response, results) => {
  for (const { attributes } of response) {
    if (isFz2(attributes)) { results.floodzone_2 = true }
    if (isFz3(attributes)) { results.floodzone_3 = true }
    if (isRiver(attributes)) { results.hasRiversSource = true }
    if (isSea(attributes)) { results.hasSeaSource = true }
    if (isRiverAndSea(attributes)) { results.hasRiversAndSeaSource = true }

    if (shouldBreak(results)) { break }
  }
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
