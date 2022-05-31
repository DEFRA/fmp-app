const FloodRiskExpandedViewModel = require('../models/flood-risk-expanded-view')
const psoContactDetails = require('../services/pso-contact')

module.exports = [{
  method: 'GET',
  path: '/flood-zone-results-explained',
  options: {
    description: 'Displays Flood Zone Results expanded Page',
    handler: async (request, h) => {
      const easting = encodeURIComponent(request.query.easting)
      const northing = encodeURIComponent(request.query.northing)
      const location = encodeURIComponent(request.query.location)
      const zone = encodeURIComponent(request.query.zone)
      const zoneNumber = encodeURIComponent(request.query.zoneNumber)
      const recipientemail = request.query.recipientemail
      const fullName = request.query.fullName
      let polygon = ''
      let useAutomatedService = true
      let psoEmailAddress = ''
      let areaName = ''

      if (request.query.polygon) {
        polygon = request.query.polygon
      }

      const result = await psoContactDetails.getPsoContacts(easting, northing)
      let localAuthorities = ''
      if (result && result.LocalAuthorities !== undefined && result.LocalAuthorities !== 0) {
        localAuthorities = result.LocalAuthorities.toString()
      }
      if (result && result.EmailAddress) {
        psoEmailAddress = result.EmailAddress
      }
      if (result && result.AreaName) {
        areaName = result.AreaName
      }
      if (result && result.useAutomatedService !== undefined && !psoContactDetails.ignoreUseAutomatedService()) {
        useAutomatedService = result.useAutomatedService
      }
      const localViewVariables = {
        zoneNumber, recipientemail, fullName, useAutomatedService, psoEmailAddress, areaName
      }
      return h.view('flood-zone-results-explained', new FloodRiskExpandedViewModel(easting, northing, location, zone, localAuthorities, polygon,
        localViewVariables))
    }
  }
},
{
  method: 'POST',
  path: '/flood-zone-results-explained',
  options: {
    description: 'Displays Flood Zone Results Expanded Page'
  },
  handler: async (request, h) => {
    return h.redirect('/contact')
  }
}]
