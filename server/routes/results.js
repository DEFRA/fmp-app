const { config } = require('../../config')
const pauseP1URL = config.functionAppUrl + '/product-one-config'
const wreck = require('@hapi/wreck')
const {
  getAreaInHectares,
  getCentreOfPolygon,
  checkParamsForPolygon
} = require('../services/shape-utils')
const { getPausePeriodStatus } = require('../services/dates')

module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        let payload
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodDataByPolygon(polygon)]
        )
        try {
          const response = await wreck.get(pauseP1URL, { json: true })
          payload = response.payload
        } catch (error) {
          payload = { pauseP1DownloadFrom: null, pauseP1DownloadTo: null } // default values if error occurs
          console.log('Error getting p1 pause', error)
        }
        const pauseP1Data = getPausePeriodStatus(payload.pauseP1DownloadFrom, payload.pauseP1DownloadTo)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.areaInHectares = getAreaInHectares(polygon)
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
        floodData.riversAndSea = floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
        return h.view('results', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, pauseP1Data })
      }
    }
  }
]
