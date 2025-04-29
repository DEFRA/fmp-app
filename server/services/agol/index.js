const { esriFeatureRequest } = require('./esriFeatureRequest')
const { esriFeatureRequestByIntersectArea } = require('./esriFeatureRequestByIntersectArea')
const { esriLayerRequest } = require('./esriLayerRequest')

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
  esriFeatureRequestByIntersectArea,
  esriLayerRequest,
  makePointGeometry,
  makePolygonGeometry
}
