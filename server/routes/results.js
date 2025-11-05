const { config } = require('../../config')
const pauseP1URL = config.functionAppUrl + '/pause-p1-download'
const wreck = require('@hapi/wreck')
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
        let pauseP1DownloadFrom, pauseP1DownloadTo
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodDataByPolygon(polygon)]
        )
        try {
          const { payload } = await wreck.get(pauseP1URL, { json: true })
          pauseP1DownloadFrom = new Date(payload.pauseP1DownloadFrom)
          pauseP1DownloadTo = new Date(payload.pauseP1DownloadTo)
          console.log(pauseP1DownloadFrom, pauseP1DownloadTo)
        } catch (error) {
          console.log('Error getting p1 pause', error)
        }
        const dateWithinPausePeriod = Date.now() >= pauseP1DownloadFrom.getTime() && Date.now() <= pauseP1DownloadTo.getTime()
        console.log('dateWithinPausePeriod', dateWithinPausePeriod)
        const p1UnpauseTimeAndDateString = `${pauseP1DownloadTo.toLocaleTimeString()} on the ${pauseP1DownloadTo.toLocaleDateString()}`
        console.log('dateWithinPausePeriod', dateWithinPausePeriod)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.areaInHectares = getAreaInHectares(polygon)
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
        floodData.riversAndSea = floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
        return h.view('results', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, dateWithinPausePeriod, p1UnpauseTimeAndDateString })
      }
    }
  }
]
