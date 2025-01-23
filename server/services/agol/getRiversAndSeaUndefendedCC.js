const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')

const layerDefs = { 0: '', 1: '' }

const LayerRiskBand = {
  0: {
    riskBandId: 0,
    riskBandPercent: '1'
  },
  1: {
    riskBandId: 1,
    riskBandPercent: '0.1'
  },
  2: {
    riskBandId: 2,
    riskBandPercent: false
  }
}

const assignResponse = (response) => {
  const lowestLayerId = response.layers.reduce((lowest, layer) => {
    return (layer.count > 0 && layer.id < lowest) ? layer.id : lowest
  }, 2)
  return {
    riversAndSeaUndefendedCC: LayerRiskBand[lowestLayerId]
  }
}

const getRiversAndSeaUndefendedCC = async (options) => {
  return esriRestRequest(config.agol.riversAndSeaUndefendedCCP1EndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getRiversAndSeaUndefendedCC }
