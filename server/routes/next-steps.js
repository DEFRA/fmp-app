const { config } = require('../../config')
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
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const [contactData, floodData, { isRiskAdminArea: isRiskAdmin }] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodZoneByPolygon(polygon),
          isRiskAdminArea(polygon)]
        )

        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isRiskAdminArea = isRiskAdmin
        return h.view('next-steps', { floodData, contactData, showOrderProduct4Button, encodedPolygon, polygon })
      }
    }
  }
]
