const { config } = require('../../../config')
const { esriRequest, makePolygonGeometry } = require('./')

const assignFloodZoneResponse = (response, results) => {
  results.in_england = response.length > 0
  for (const { attributes } of response) {
    results.floodzone_2 = results.floodzone_2 || (attributes.flood_zone === 'FZ2')
    results.floodzone_3 = results.floodzone_3 || (attributes.flood_zone === 'FZ3')
    if (results.floodzone_2 && results.floodzone_3) {
      break // We can stop early once we find FZs 2 and 3
    }
  }
  results.floodZone = results.floodzone_3 ? '3' : results.floodzone_2 ? '2' : '1'
  return results
}

const getFloodZones = async (options = {}) => {
  const results = {
    in_england: false,
    floodzone_2: false,
    floodzone_3: false,
    reduction_in_rofrs: false, // TODO - will probably be dropped with NAFRA2
    surface_water: false, // TODO - a new end point will be provided
    extra_info: null // TODO Risk Admin shape intersection
  }

  await esriRequest(config.agol.floodZonesRiversAndSeaEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignFloodZoneResponse(esriResponse, results))

  return results
}

module.exports = { getFloodZones }
