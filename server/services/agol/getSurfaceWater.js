const { config } = require('../../../config')
const { esriRequest, makePolygonGeometry } = require('.')

const riskBandPriority = {
  false: -1,
  Low: 1,
  Medium: 2,
  High: 3
}

const assignResponse = (response, results) => {
  let highestRiskBand = false
  response.forEach(item => {
    const riskBand = item.attributes.Risk_band
    if (riskBandPriority[riskBand] > riskBandPriority[highestRiskBand]) {
      highestRiskBand = riskBand
    }
  })
  results.surface_water_risk_band = highestRiskBand
  return results
}

const getSurfaceWater = async (options) => {
  const results = {
    surface_water_risk_band: false
  }

  return esriRequest(config.agol.surfaceWaterEndPoint, makePolygonGeometry(options.polygon), 'esriGeometryPolygon')
    .then((esriResponse) => assignResponse(esriResponse, results))
}

module.exports = { getSurfaceWater }
