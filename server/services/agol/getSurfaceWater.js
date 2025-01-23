const { config } = require('../../../config')
const { esriRequest, makePolygonGeometry } = require('.')

const riskBandPriority = {
  false: {
    riskBandId: -1,
    riskBand: false
  },
  Low: {
    riskBandId: 1,
    riskBand: 'Low'
  },
  Medium: {
    riskBandId: 2,
    riskBand: 'Medium'
  },
  High: {
    riskBandId: 3,
    riskBand: 'High'
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
  return esriRequest(config.agol.surfaceWaterEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignResponse(esriResponse))
}

module.exports = { getSurfaceWater }
