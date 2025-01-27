const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')
const { riversAndSeaDefended: layerRiskBand } = require('./layerRiskBands')
const { riversAndSeaDefended: layerDefs } = require('./layerDefs')

const assignResponse = (response) => {
  const lowestLayerId = response.layers.reduce((lowest, layer) => {
    return (layer.count > 0 && layer.id < lowest) ? layer.id : lowest
  }, Number(Object.keys(layerRiskBand)[Object.keys(layerRiskBand).length - 1])) // Max layer ID for comparison
  return {
    riversAndSeaDefended: layerRiskBand[lowestLayerId]
  }
}

const getRiversAndSeaDefended = async (options) => {
  return esriRestRequest(config.agol.riversAndSeaDefendedEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getRiversAndSeaDefended }
