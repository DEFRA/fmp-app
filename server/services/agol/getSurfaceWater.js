const { config } = require('../../../config')
const { esriFeatureRequest, makePolygonGeometry } = require('.')

const riskBandPriority = {
  false: {
    riskBandId: -1,
    riskBand: false
  },
  Low: {
    riskBandId: 1,
    riskBand: 'Low',
    riskBandPercent: '0.1',
    riskBandOdds: '1 in 1000'
  },
  Medium: {
    riskBandId: 2,
    riskBand: 'Medium',
    riskBandPercent: '1',
    riskBandOdds: '1 in 100'
  },
  High: {
    riskBandId: 3,
    riskBand: 'High',
    riskBandPercent: '3.3',
    riskBandOdds: '1 in 30'
  }
}

const assignResponse = (response) => {
  const highestRiskBand = response.reduce((highest, item) => {
    const riskBand = item.attributes.Risk_band
    return riskBandPriority[riskBand].riskBandId > riskBandPriority[highest].riskBandId ? riskBand : highest
  }, false)
  return {
    surfaceWater: riskBandPriority[highestRiskBand]
  }
}

const getSurfaceWater = async (options) => {
  return esriFeatureRequest(config.agol.surfaceWaterEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getSurfaceWater }
