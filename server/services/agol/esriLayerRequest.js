const { esriRequest } = require('./esriRequest')

const esriLayerRequest = async (endPoint, geometry, geometryType, layerDefs) => {
  return esriRequest(endPoint, geometry, geometryType, { layerDefs, returnCountOnly: 'true', returnGeometry: 'false' })
}

module.exports = { esriLayerRequest }
