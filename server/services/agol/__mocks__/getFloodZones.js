const mockPolygons = require('./mockPolygons.json')
const getFloodZones = (options) => {
  switch (options.polygon) {
    case mockPolygons.fz1_only:
      return { floodZone: '1', floodzone_2: false, floodzone_3: false }
    case mockPolygons.fz2_only:
      return { floodZone: '2', floodzone_2: true, floodzone_3: false }
    case mockPolygons.fz3_only:
      return { floodZone: '3', floodzone_2: false, floodzone_3: true }
    case mockPolygons.fz2_and_3:
      return { floodZone: '3', floodzone_2: true, floodzone_3: true }
    default: {
      throw new Error('Error - No Polygon Mocked')
    }
  }
}

module.exports = { getFloodZones }
