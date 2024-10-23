const util = require('../util')
const { config } = require('../../config')
const urlByPolygon = config.service + '/zones-by-polygon'

const getByPolygon = (polygon) => {
  if (!polygon) {
    throw new Error('No Polygon provided')
  }
  return util.getJson(`${urlByPolygon}?polygon=${polygon}`)
}
module.exports = { getByPolygon }
