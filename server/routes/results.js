module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        const contactData = await request.server.methods.getPsoContactsByPolygon(polygon)
        const showOrderProduct4Button = contactData.useAutomatedService === true
        const floodData = await request.server.methods.getFloodZonesByPolygon(polygon)
        return h.view('results', { polygon, floodData, contactData, showOrderProduct4Button })
      }
    }
  }
]
