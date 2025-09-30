const { decode } = require('@mapbox/polyline')

const decodePolygon = (polygon) => {
  let parsedPolygon
  try {
    const confirmedJSON = JSON.parse(polygon)
    if (Array.isArray(confirmedJSON) && Array.isArray(confirmedJSON[0])) {
      parsedPolygon = polygon
      return parsedPolygon
    } else {
      throw new Error('not a polygon array')
    }
  } catch {
    const decodedResult = decode(polygon)
    parsedPolygon = JSON.stringify(decodedResult)
    return parsedPolygon
  }
}

module.exports = {
  decodePolygon
}
