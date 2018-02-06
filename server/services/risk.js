const util = require('../util')
const config = require('../../config')
const url = config.service + '/zones/'

module.exports = {
  getByPoint: (easting, northing) => {
    if (!easting || !northing) {
      throw new Error('No Point provided')
    }

    return util.getJson(`${url}?easting=${easting}&northing={northing}&radius=1`)
  },
  getByPolygon: (polygon) => {
    if (!polygon) {
      throw new Error('No Polygon provided')
    }

    return util.getJson(`${url}?polygon=${JSON.stringify(polygon)}`)
  }
}
