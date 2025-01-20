const { config } = require('../../../config')
const { esriRequest, makePolygonGeometry } = require('./')

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
  } else if (results.floodzone_2) {
    results.floodZone = '2'
  } else {
    results.floodZone = '1'
  }
  return results
}

const getFloodZones = async (options) => {
  const results = {
    floodzone_2: false,
    floodzone_3: false
  }

  return esriRequest(config.agol.floodZonesRiversAndSeaEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignFloodZoneResponse(esriResponse, results))
}

module.exports = { getFloodZones }
