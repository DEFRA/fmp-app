const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')
const { riversAndSeaDefended: layerRiskBand } = require('./layerRiskBands')
const { riversAndSeaDefended: layerDefs } = require('./layerDefs')

const assignResponse = (response) => {
  const lowestLayerId = response.layers.reduce((lowest, layer) => {
    return (layer.count > 0 && layer.id < lowest) ? layer.id : lowest
  }, Number(Object.keys(layerRiskBand)[Object.keys(layerRiskBand).length - 1])) // Max layer ID for comparison
  return {
    riversAndSeaDefendedCC: layerRiskBand[lowestLayerId]
  }
}

const getRiversAndSeaDefendedCC = async (options) => {
  return esriRestRequest(config.agol.riversAndSeaDefendedCCP1EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getRiversAndSeaDefendedCC }
