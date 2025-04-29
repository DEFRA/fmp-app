const { esriFeatureRequest, esriRequestByIntersectArea } = require('./esriRequest')
const { esriLayerRequest } = require('./esriRestRequest')

const makePointGeometry = (x, y) => ({ x, y, spatialReference: { wkid: 27700 } })

const makePolygonGeometry = (polygon) => {
  polygon = Array.isArray(polygon) ? polygon : JSON.parse(polygon)
  return {
    rings: [polygon],
    spatialReference: { wkid: 27700 }
  }
}

module.exports = {
  esriFeatureRequest,
  esriRequestByIntersectArea,
  esriLayerRequest,
  makePointGeometry,
  makePolygonGeometry
}
