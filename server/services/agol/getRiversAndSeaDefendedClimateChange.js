const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')

const layerDefs = { 0: '', 1: '', 2: '' }

const LayerRiskBand = {
  0: 'more than a 3.3%',
  1: 'a 1%',
  2: 'less than a 0.1%',
  3: false
}

const assignResponse = (response, results) => {
  let lowestLayerId = 3
  response.layers.forEach(layer => {
    if (layer.count > 0) {
      if (layer.id < lowestLayerId) {
        lowestLayerId = layer.id
      }
    }
  })
  results.rivers_and_sea_defended_climate_change_1_risk_band = LayerRiskBand[lowestLayerId]
  return results
}

const getRiversAndSeaDefendedClimateChange = async (options) => {
  const results = {
    rivers_and_sea_defended_climate_change_1_risk_band: false
  }
  return esriRestRequest(config.agol.riversAndSeaDefendedCCP1EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse, results))
}

module.exports = { getRiversAndSeaDefendedClimateChange }
