const { config } = require('../../config')
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
        const contactData = await request.server.methods.getPsoContactsByPolygon(polygon)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        const floodData = await request.server.methods.getFloodZoneByPolygon(polygon)
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        return h.view('next-steps', { polygon, floodData, contactData, showOrderProduct4Button })
      }
    }
  }
]
