module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        const floodData = await request.server.methods.getFloodZonesByPolygon(polygon)
        return h.view('results', { polygon, floodData })
      }
    }
  }
]
