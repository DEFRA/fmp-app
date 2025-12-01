const { config } = require('../../config')
const pauseP1URL = config.functionAppUrl + '/product-one-config'
const { isRiskAdminArea } = require('../services/riskAdmin/isRiskAdminArea')
const {
  getCentreOfPolygon,
  checkParamsForPolygon
} = require('../services/shape-utils')
const { getPausePeriodStatus } = require('../services/dates')
const { getProductOnePause } = require('../services/getProductOnePause')

module.exports = [
  {
    method: 'GET',
    path: '/next-steps',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const [contactData, floodData, { isRiskAdminArea: isRiskAdmin }] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodZoneByPolygon(polygon),
          isRiskAdminArea(polygon)]
        )
        const payload = await getProductOnePause(pauseP1URL)
        const pauseP1Data = getPausePeriodStatus(payload?.pauseP1DownloadFrom, payload?.pauseP1DownloadTo)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isRiskAdminArea = isRiskAdmin
        return h.view('next-steps', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon, pauseP1Data })
      }
    }
  }
]
