const { esriFeatureRequest } = require('./esriFeatureRequest')
const turf = require('@turf/turf')

const esriFeatureRequestByIntersectArea = async (endPoint, geometry, geometryType) => {
  const response = await esriFeatureRequest(endPoint, geometry, geometryType)
  if (Array.isArray(response) && response?.length > 1) {
    // FCRM-5361 - If more than 1 result found, re-request with geometry and sort by intersecting area size
    const turfPolygon = turf.polygon(geometry.rings)
    return esriFeatureRequest(endPoint, geometry, geometryType, { returnGeometry: 'true', maxAllowableOffset: 100 })
      .then((esriResult) => esriResult.map((result) => {
        try {
          const areaPolygon = turf.polygon(result.geometry.rings)
          const intersection = turf.intersect(turfPolygon, areaPolygon)
          const area = turf.area(intersection)
          return { ...result, area }
        } catch (error) {
          console.log('error when calculating area intersection:', error)
          return { ...result, area: 0 }
        }
      })).then((esriResult) => esriResult.sort((a, b) => b.area - a.area))
  }
  return response
}

module.exports = { esriFeatureRequestByIntersectArea }
