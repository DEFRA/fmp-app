const { config } = require('../../config')
const constants = require('../constants')
const { isEnglandService } = require('../services/is-england')
const pauseP1URL = config.functionAppUrl + '/product-one-config'
const { getProductOnePause } = require('../services/getProductOnePause')
const {
  getAreaInHectares,
  getCentreOfPolygon,
  checkParamsForPolygon
} = require('../services/shape-utils')

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
        if (!contactData.isEngland) {
          // NO contactData.isEngland implies that we do not have an areaTeam
          // so we do another check to see if the centroid is in england
          const coordinates = getCentreOfPolygon(polygon)
          const isInEngland = await isEnglandService(coordinates.x, coordinates.y)
          if (isInEngland === false) {
            // If both checks fail, we redirect the user to the england-only page
            return h.redirect(`${constants.routes.ENGLAND_ONLY}`)
            // Otherwise we continue, but we wont have an AreaName or EmailAddress
            // and are by default opted out.
            // So we handle that issue on the nunjucks page
          }
        }
        const pauseP1Data = await getProductOnePause(pauseP1URL)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.areaInHectares = getAreaInHectares(polygon)
        const over300Hectares = floodData.areaInHectares > constants.maxAreaInHectares
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
        floodData.riversAndSea = floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
        floodData.hasSurfaceWater = Boolean(floodData?.surfaceWater?.riskBand || floodData?.surfaceWaterClimateChange)
        return h.view('results', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, pauseP1Data, over300Hectares })
      }
    }
  }
]
