const util = require('../util')
const config = require('../../config')
const url = config.service + '/zones'
const urlByPolygon = config.service + '/zones-by-polygon'

module.exports = {
  getByPoint: (easting, northing) => {
    if (!easting || !northing) {
      throw new Error('No Point provided')
    }

    return util.getJson(`${url}/${easting}/${northing}/1`)
  },
  getByPolygon: (polygon) => {
    if (!polygon) {
      throw new Error('No Polygon provided')
    }

    return util.getJson(`${urlByPolygon}?polygon=${polygon}`)
  }
}
