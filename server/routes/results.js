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
        const coordinates = getCentreOfPolygon(polygon)
        const isInEngland = await isEnglandService(coordinates.x, coordinates.y)
        if (isInEngland === false) {
          return h.redirect(`${constants.routes.ENGLAND_ONLY}`)
        }
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodDataByPolygon(polygon)]
        )
        const pauseP1Data = await getProductOnePause(pauseP1URL)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.areaInHectares = getAreaInHectares(polygon)
        const over300Hectares = floodData.areaInHectares > 300
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
        floodData.riversAndSea = floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
        return h.view('results', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, pauseP1Data, over300Hectares })
      }
    }
  }
]
