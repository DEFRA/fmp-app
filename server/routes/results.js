const { isRiskAdminArea } = require('../services/riskAdmin/isRiskAdminArea')
module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        await isRiskAdminArea(polygon)
        return h.view('results', { polygon })
      }
    }
  }
]
