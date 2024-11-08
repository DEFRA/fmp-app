const { config } = require('../../../config')
const { esriRequest, makePolygonGeometry } = require('./')

const parseFloodZoneResponse = (response) => {
  console.log('getFloodZones ezri response', response)
  const results = {
    in_england: response.length > 0,
    floodzone_2: false,
    floodzone_3: false,
    reduction_in_rofrs: false, // TODO - will probably be dropped with NAFRA2
    surface_water: false, // TODO - a new end point will be provided
    extra_info: null // TODO Risk Admin shape intersection
  }

  for (const { attributes } of response) {
    results.floodzone_2 = results.floodzone_2 || (attributes.flood_zone === 'FZ2')
    results.floodzone_3 = results.floodzone_3 || (attributes.flood_zone === 'FZ3')
    if (results.floodzone_2 && results.floodzone_3) {
      break // We can stop early once we find FZs 2 and 3
    }
  }
  console.log('getFloodZones response', results)
  return results
}

const getFloodZones = async (options = {}) => {
  return esriRequest(config.agol.floodZonesRiversAndSeaEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => parseFloodZoneResponse(esriResponse))
}

module.exports = { getFloodZones }
