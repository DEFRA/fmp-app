const FloodRiskLocationViewModel = require('../models/flood-risk-view')
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
      let psoEmailAddress = ''
      let areaName = ''
      if (result && result.EmailAddress) {
        psoEmailAddress = result.EmailAddress
      }
      if (result && result.AreaName) {
        areaName = result.AreaName
      }
      var model = new FloodRiskLocationViewModel({
        psoEmailAddress: psoEmailAddress,
        zone: 3,
        areaName: areaName
      })
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
