const FloodRiskExpandedViewModel = require('../models/flood-risk-expanded-view')

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
      const polygon = request.query.polygon ? request.query.polygon : ''
      let useAutomatedService = true
      let psoEmailAddress = ''
      let areaName = ''
      let localAuthorities = ''

      const result = await request.server.methods.getPsoContacts(easting, northing)
      if (result) {
        const { LocalAuthorities, EmailAddress, AreaName } = result
        if (LocalAuthorities !== undefined && LocalAuthorities !== 0) {
          localAuthorities = LocalAuthorities.toString()
        }
        if (EmailAddress) {
          psoEmailAddress = EmailAddress
        }
        if (AreaName) {
          areaName = AreaName
        }
        if (result.useAutomatedService !== undefined && !request.server.methods.ignoreUseAutomatedService()) {
          useAutomatedService = result.useAutomatedService
        }
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
