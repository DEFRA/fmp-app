const { config } = require('../../config')
const constants = require('../constants')
const pauseP1URL = config.functionAppUrl + '/product-one-config'
const { getProductOnePause } = require('../services/getProductOnePause')
const isEnglandService = require('../services/is-england')
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
  floodData.hasSurfaceWater = Boolean(floodData?.surfaceWater?.riskBandOdds || floodData?.surfaceWaterClimateChange)
  floodData.hasFloodRisk = floodData.surfaceWater?.riskBandOdds || floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
  return floodData
}

const isInEngland = async (contactData, polygon) => {
  if (contactData.isEngland) {
    // isEngland is set to true in getPsoContactsByPolygon if there is an areaTeam
    // So we can be confident that the location is in England if there is an areaTeam
    return true
  }
  if (!contactData.LocalAuthorities) {
    // If there is no local authority data AND no area team
    // then we can be confident that the location is not in England - usually off the coast
    return false
  }
  // The local authority could potentially be Welsh or Scottish
  // so we need to do an is in england polygon check too if all else fails.
  // If this returns true, then we know we are at least partially in England,
  // and can proceed with the results page.
  // where it will show a contact the EA notice, in place of order a product 4 button.
  return isEnglandService.isPolygonInEngland(polygon)
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
          request.server.methods.getFloodDataByPolygon(polygon)
        ])
        if (!await isInEngland(contactData, polygon)) {
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
