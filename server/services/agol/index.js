const { esriRequest } = require('./esriRequest')
const { esriRestRequest } = require('./esriRestRequest')

const makePointGeometry = (x, y) => ({ x, y, spatialReference: { wkid: 27700 } })

const makePolygonGeometry = (polygon) => {
  polygon = Array.isArray(polygon) ? polygon : JSON.parse(polygon)
  return {
    rings: [polygon],
    spatialReference: { wkid: 27700 }
  }
}

module.exports = { esriRequest, esriRestRequest, makePointGeometry, makePolygonGeometry }
