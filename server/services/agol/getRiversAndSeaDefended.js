const { config } = require('../../../config')
const { esriRestRequest, makePolygonGeometry } = require('.')

const layerDefs = { 0: '', 1: '', 2: '' }

const LayerRiskBand = {
  0: {
    riskBandId: 0,
    riskBandPercent: '3.3'
  },
  1: {
    riskBandId: 1,
    riskBandPercent: '1'
  },
  2: {
    riskBandId: 2,
    riskBandPercent: '0.1'
  },
  3: {
    riskBandId: 3,
    riskBandPercent: false
  }
}

const assignResponse = (response) => {
  const lowestLayerId = response.layers.reduce((lowest, layer) => {
    return (layer.count > 0 && layer.id < lowest) ? layer.id : lowest
  }, 3)
  return {
    riversAndSeaDefended: LayerRiskBand[lowestLayerId]
  }
}

const getRiversAndSeaDefended = async (options) => {
  return esriRestRequest(config.agol.riversAndSeaDefendedEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon', layerDefs)
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getRiversAndSeaDefended }
