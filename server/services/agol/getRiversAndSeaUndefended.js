const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')
const { riversAndSeaUndefended: layerRiskBand } = require('./layerRiskBands')
const { riversAndSeaUndefended: layerDefs } = require('./layerDefs')

const assignResponse = (response) => {
  const lowestLayerId = response.layers.reduce((lowest, layer) => {
    return (layer.count > 0 && layer.id < lowest) ? layer.id : lowest
  }, 2)
  return {
    riversAndSeaUndefended: layerRiskBand[lowestLayerId]
  }
}

const getRiversAndSeaUndefended = async (options) => {
  return esriRestRequest(config.agol.riversAndSeaUndefendedEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getRiversAndSeaUndefended }
