const getAreaPolygon = require('area-polygon')

const getArea = polygon => {
  polygon = polygonToArray(polygon)
  if (polygon) {
    return (polygon.length && polygon.length > 2) ? getAreaPolygon(polygon) : 0
  }
  return undefined
}

const getAreaInHectares = polygon => {
  const areaInSqM = getArea(polygon)
  const areaInHectares = (areaInSqM !== undefined) ? Math.round((areaInSqM / 10000) * 100) / 100 : undefined
  return (areaInHectares !== undefined) ? `${areaInHectares}` : undefined
}

const polygonToArray = polygon => {
  if (!polygon) {
    return undefined
  }
  return (Array.isArray(polygon)) ? polygon : JSON.parse(polygon)
}

// NB polygonStartEnd is only applicable if the polygon is a line or a single point
// it returns the start and end positions along the x axis
const polygonStartEnd = polygon => {
  polygon = polygon.sort(([x1, y1], [x2, y2]) => (x1 - x2) ? (x1 - x2) : (y1 - y2))
  return [polygon[0], polygon[polygon.length - 1]]
}

const _isPoint = minMax => minMax[0][0] === minMax[1][0] && minMax[0][1] === minMax[1][1]
const _isYBuff = ([[minX, minY], [maxX, maxY]]) =>
  (Math.abs(maxX - minX) >= Math.abs(maxY - minY))

const buffPolygon = polygon => {
  const minMax = polygonStartEnd(polygon)
  const [[startX, startY], [endX, endY]] = minMax
  if (_isPoint(minMax)) {
    return [[startX, startY], [startX, startY + 1], [startX + 1, startY + 1], [startX + 1, startY], [startX, startY]]
  }
  if (_isYBuff(minMax)) {
    return [[startX, startY], [startX, startY + 1], [endX, endY + 1], [endX, endY], [startX, startY]]
  }
  return [[startX, startY], [endX, endY], [endX + 1, endY], [startX + 1, startY], [startX, startY]]
}

module.exports = { getArea, getAreaInHectares, polygonToArray, buffPolygon, polygonStartEnd }
