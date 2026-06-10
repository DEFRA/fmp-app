const { config } = require('../../config')
const constants = require('../constants')
const pauseP1URL = config.functionAppUrl + '/product-one-config'
const { getProductOnePause } = require('../services/getProductOnePause')
const {
  getAreaInHectares,
  getCentreOfPolygon,
  checkParamsForPolygon
} = require('../services/shape-utils')

const enhanceFloodData = (floodData, polygon) => {
  floodData.areaInHectares = getAreaInHectares(polygon)
  floodData.centreOfPolygon = getCentreOfPolygon(polygon)
  floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
  floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
  floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
  floodData.hasSurfaceWater = Boolean(floodData?.surfaceWater?.riskBand || floodData?.surfaceWaterClimateChange)
  floodData.hasFloodRisk = floodData.surfaceWater?.riskBand || floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
  return floodData
}

module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodDataByPolygon(polygon)]
        )
        if (contactData.isEngland === false && !contactData.LocalAuthorities) {
          // Only redirect to England only page if the location is not in England
          // and there is no local authority data, otherwise show the results
          // page with the EA national team contact data
          return h.redirect(`${constants.routes.ENGLAND_ONLY}`)
        }
        const pauseP1Data = await getProductOnePause(pauseP1URL)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        enhanceFloodData(floodData, polygon)
        const over300Hectares = floodData.areaInHectares > constants.maxAreaInHectares
        return h.view('results', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, pauseP1Data, over300Hectares })
      }
    }
  }
]
