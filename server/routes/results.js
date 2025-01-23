const { config } = require('../../config')

module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        const contactData = await request.server.methods.getPsoContactsByPolygon(polygon)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        const floodData = await request.server.methods.getFloodDataByPolygon(polygon)
        return h.view('results', { polygon, floodData, contactData, showOrderProduct4Button })
      }
    }
  }
]
