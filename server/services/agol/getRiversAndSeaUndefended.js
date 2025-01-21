const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')

const layerDefs = { 0: '', 1: '' }

const LayerRiskBand = {
  0: 'a 1%',
  1: 'less than a 0.1%',
  2: false
}

const assignResponse = (response, results) => {
  let lowestLayerId = 2
  response.layers.forEach(layer => {
    if (layer.count > 0) {
      if (layer.id < lowestLayerId) {
        lowestLayerId = layer.id
      }
    }
  })
  results.rivers_and_sea_undefended_risk_band = LayerRiskBand[lowestLayerId]
  return results
}

const getRiversAndSeaUndefended = async (options) => {
  const results = {
    rivers_and_sea_undefended_risk_band: false
  }
  return esriRestRequest(config.agol.riversAndSeaUndefendedEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse, results))
}

module.exports = { getRiversAndSeaUndefended }
