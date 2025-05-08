const { config } = require('../../../config')
const { esriLayerRequest, makePolygonGeometry } = require('.')
const { riversAndSeaUndefended: layerRiskBand } = require('./layerRiskBands')
const { riversAndSeaUndefended: layerDefs } = require('./layerDefs')

const assignResponse = (response) => {
  const lowestLayerId = response.layers.reduce((lowest, layer) => {
    return (layer.count > 0 && layer.id < lowest) ? layer.id : lowest
  }, Number(Object.keys(layerRiskBand)[Object.keys(layerRiskBand).length - 1])) // Max layer ID for comparison
  return {
    riversAndSeaUndefended: layerRiskBand[lowestLayerId]
  }
}

const getRiversAndSeaUndefended = async (options) => {
  return esriLayerRequest(config.agol.riversAndSeaUndefendedEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getRiversAndSeaUndefended }
