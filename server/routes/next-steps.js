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
        const { polygon, encodedPolygon } = request.query
        const processedPolygonQuery = checkParamsForPolygon(polygon, encodedPolygon)
        const [contactData, floodData, { isRiskAdminArea: isRiskAdmin }] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(processedPolygonQuery.polygonArray),
          request.server.methods.getFloodZoneByPolygon(processedPolygonQuery.polygonArray),
          isRiskAdminArea(processedPolygonQuery.polygonArray)]
        )

        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.centreOfPolygon = getCentreOfPolygon(processedPolygonQuery.polygonArray)
        floodData.isRiskAdminArea = isRiskAdmin
        return h.view('next-steps', { floodData, contactData, showOrderProduct4Button, processedPolygonQuery })
      }
    }
  }
]
