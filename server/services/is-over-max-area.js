const constants = require('../constants')
const { getAreaInHectares } = require('./shape-utils')

const isOverMaxArea = (polygon) => {
  const areaInHectares = Number(getAreaInHectares(polygon))
  return Number.isFinite(areaInHectares) && areaInHectares > constants.maxAreaInHectares
}

module.exports = { isOverMaxArea }
