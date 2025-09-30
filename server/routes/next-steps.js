const { config } = require('../../config')
const { isRiskAdminArea } = require('../services/riskAdmin/isRiskAdminArea')
const {
  getCentreOfPolygon
} = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: '/next-steps',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        const [contactData, floodData, { isRiskAdminArea: isRiskAdmin }] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodZoneByPolygon(polygon),
          isRiskAdminArea(polygon)]
        )

        const showOrderProduct4Button = config.requestType === 'internal' || contactData.useAutomatedService === true
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isRiskAdminArea = isRiskAdmin
        return h.view('next-steps', { polygon, floodData, contactData, showOrderProduct4Button })
      }
    }
  }
]
