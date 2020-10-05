const FloodRiskExpandedViewModel = require('../models/flood-risk-expanded-view')
const psoContactDetails = require('../services/pso-contact')

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
      const zone = encodeURIComponent(request.query.zone)
      var polygon = ''

      if (request.query.polygon) {
        polygon = request.query.polygon
      }

      const result = await psoContactDetails.getPsoContacts(easting, northing)
      var localAuthorities = ''
      if (result && result.LocalAuthorities !== undefined && result.LocalAuthorities !== 0) {
        localAuthorities = result.LocalAuthorities.toString()
      }
      return h.view('flood-zone-results-expanded', new FloodRiskExpandedViewModel(easting, northing, zone, localAuthorities, polygon))
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
