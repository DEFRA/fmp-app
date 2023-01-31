const util = require('../util')
const config = require('../../config')
const url = config.service + '/zones'
const urlByPolygon = config.service + '/zones-by-polygon'
const getAreaPolygon = require('area-polygon')

const getByPoint = (easting, northing) => {
  if (!easting || !northing) {
    throw new Error('No Point provided')
  }

  return util.getJson(`${url}/${easting}/${northing}/1`)
}
const getByPolygon = (polygon) => {
  if (!polygon) {
    throw new Error('No Polygon provided')
  }
  const { coordinates = [] } = JSON.parse(polygon)

  const area = getAreaPolygon(coordinates[0])
  if (area === 0 || area === '0') {
    return getByPoint(coordinates[0][0][0], coordinates[0][0][1])
  } else {
    return util.getJson(`${urlByPolygon}?polygon=${polygon}`)
  }
}
module.exports = { getByPoint, getByPolygon }
