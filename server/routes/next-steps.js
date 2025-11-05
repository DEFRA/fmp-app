const { config } = require('../../config')
const pauseP1URL = config.functionAppUrl + '/pause-p1-download'
const wreck = require('@hapi/wreck')
const { isRiskAdminArea } = require('../services/riskAdmin/isRiskAdminArea')
const {
  getCentreOfPolygon,
  checkParamsForPolygon
} = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: '/next-steps',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        let pauseP1DownloadFrom, pauseP1DownloadTo
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const [contactData, floodData, { isRiskAdminArea: isRiskAdmin }] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodZoneByPolygon(polygon),
          isRiskAdminArea(polygon)]
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
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isRiskAdminArea = isRiskAdmin
        return h.view('next-steps', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, dateWithinPausePeriod, p1UnpauseTimeAndDateString })
      }
    }
  }
]
