const { config } = require('../../config')
const pauseP1URL = config.functionAppUrl + '/product-one-config'
const wreck = require('@hapi/wreck')
const { isRiskAdminArea } = require('../services/riskAdmin/isRiskAdminArea')
const {
  getCentreOfPolygon,
  checkParamsForPolygon
} = require('../services/shape-utils')
const { getPausePeriodStatus } = require('../services/dates')

module.exports = [
  {
    method: 'GET',
    path: '/next-steps',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        let payload
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const [contactData, floodData, { isRiskAdminArea: isRiskAdmin }] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodZoneByPolygon(polygon),
          isRiskAdminArea(polygon)]
        )
        try {
          const response = await wreck.get(pauseP1URL, { json: true })
          payload = response.payload
        } catch (error) {
          payload = { pauseP1DownloadFrom: null, pauseP1DownloadTo: null } // default values if error occurs
          console.log('Error getting p1 pause', error)
        }
        const pauseP1Data = getPausePeriodStatus(payload?.pauseP1DownloadFrom, payload?.pauseP1DownloadTo)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isRiskAdminArea = isRiskAdmin
        return h.view('next-steps', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, pauseP1Data })
      }
    }
  }
]
