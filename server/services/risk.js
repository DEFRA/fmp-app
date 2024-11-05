const util = require('../util')
const { config } = require('../../config')
const urlByPolygon = config.service + '/zones-by-polygon'

const getByPolygon = async (polygon) => {
  if (!polygon) {
    throw new Error('No Polygon provided')
  }
  return util.getJson(`${urlByPolygon}?polygon=${polygon}`).then((result) => {
    console.log('risk.getByPolygon result', result)
    return result
  })
}
module.exports = { getByPolygon }
