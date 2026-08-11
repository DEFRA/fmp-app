const { config } = require('../../config')
const { esriFeatureRequest, makePointGeometry, makePolygonGeometry } = require('./agol')

const isEnglandService = async (easting, northing) => {
  if (!easting || !northing) {
    throw new Error('No point provided')
  }
  return esriFeatureRequest(config.agol.isEnglandEndPoint, makePointGeometry(easting, northing), 'esriGeometryPoint')
    .then((esriResult) => {
      return esriResult && Array.isArray(esriResult) && esriResult.length > 0
    })
}

const isPolygonInEngland = async (polygon) => {
  if (!polygon) {
    throw new Error('No polygon provided')
  }
  return esriFeatureRequest(config.agol.isEnglandEndPoint, makePolygonGeometry(polygon), 'esriGeometryPolygon')
    .then((esriResult) => {
      return esriResult && Array.isArray(esriResult) && esriResult.length > 0
    })
}

module.exports = { isEnglandService, isPolygonInEngland }
