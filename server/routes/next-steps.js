const { config } = require('../../config')
const { isRiskAdminArea } = require('../services/riskAdmin/isRiskAdminArea')
const {
  getCentreOfPolygon,
  decodePolygon
} = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: '/next-steps',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        const decodedPolygon = decodePolygon(polygon)
        const [contactData, floodData, { isRiskAdminArea: isRiskAdmin }] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(decodedPolygon),
          request.server.methods.getFloodZoneByPolygon(decodedPolygon),
          isRiskAdminArea(decodedPolygon)]
        )

        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.centreOfPolygon = getCentreOfPolygon(decodedPolygon)
        floodData.isRiskAdminArea = isRiskAdmin
        return h.view('next-steps', { polygon, floodData, contactData, showOrderProduct4Button, decodedPolygon })
      }
    }
  }
]
