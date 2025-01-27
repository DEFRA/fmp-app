const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')
const { riversAndSeaUndefended: layerRiskBand } = require('./layerRiskBands')
const { riversAndSeaUndefended: layerDefs } = require('./layerDefs')

const assignResponse = (response) => {
  const lowestLayerId = response.layers.reduce((lowest, layer) => {
    return (layer.count > 0 && layer.id < lowest) ? layer.id : lowest
  }, Number(Object.keys(layerRiskBand)[Object.keys(layerRiskBand).length - 1])) // Max layer ID for comparison
  return {
    riversAndSeaUndefendedCC: layerRiskBand[lowestLayerId]
  }
}

const getRiversAndSeaUndefendedCC = async (options) => {
  return esriRestRequest(config.agol.riversAndSeaUndefendedCCP1EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getRiversAndSeaUndefendedCC }
