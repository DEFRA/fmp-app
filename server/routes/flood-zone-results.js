const FloodRiskViewModel = require('../models/flood-risk-view')
const psoContactDetails = require('../services/pso-contact')
module.exports = [{
  method: 'GET',
  path: '/flood-zone-results',
  options: {
    description: 'Displays Flood Zone Three Results Page',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      const result = await psoContactDetails.getPsoContacts(383819, 398052)
      var model = new FloodRiskViewModel()
      if (result && result.EmailAddress) {
        model.psoEmailAddress = result.EmailAddress
      }
      if (result && result.AreaName) {
        model.areaName = result.AreaName
      }
      model.zone = 3
      return h.view('flood-zone-results', model)
    }
  }
},
{
  method: 'POST',
  path: '/flood-zone-results',
  options: {
    description: 'Displays Flood Zone Three Results Page',
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.redirect('/contact')
  }
}]
