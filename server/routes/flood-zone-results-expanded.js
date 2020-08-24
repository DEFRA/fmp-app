const FloodRiskExpandedViewModel = require('../models/flood-risk-expanded-view')

module.exports = [{
  method: 'GET',
  path: '/flood-zone-results-expanded',
  options: {
    description: 'Displays Flood Zone Results expanded Page',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      const easting = encodeURIComponent(request.query.easting)
      const northing = encodeURIComponent(request.query.northing)
      return h.view('flood-zone-results-expanded', new FloodRiskExpandedViewModel(easting, northing))
    }
  }
},
{
  method: 'POST',
  path: '/flood-zone-results-expanded',
  options: {
    description: 'Displays Flood Zone Results Expanded Page',
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.redirect('/contact')
  }
}]
