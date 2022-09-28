const getAreaPloygon = require('area-polygon')

const getArea = polygonString => {
  const polygonArray = polygonStringToArray(polygonString)
  if (polygonArray) {
    return (polygonArray.length && polygonArray.length > 2) ? getAreaPloygon(polygonArray) : 0
  }
  return undefined
}

const getAreaInHectares = polygonString => {
  const areaInSqM = getArea(polygonString)
  const areaInHectares = (areaInSqM !== undefined) ? Math.round((areaInSqM / 10000) * 100) / 100 : undefined
  return (areaInHectares !== undefined) ? `${areaInHectares}` : undefined
}

const polygonStringToArray = polygonString => polygonString ? JSON.parse(polygonString) : undefined

module.exports = { getArea, getAreaInHectares, polygonStringToArray }
