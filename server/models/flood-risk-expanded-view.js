
function FloodRiskExpandedViewModel (easting, northing, location, zone, localAuthorities, polygon, localViewVariables) {
  const { zoneNumber, recipientemail, fullName, useAutomatedService, psoEmailAddress, areaName } = localViewVariables
  this.easting = easting
  this.northing = northing
  this.location = location
  this.zone = zone
  this.localAuthorities = localAuthorities
  this.zoneNumber = zoneNumber
  this.recipientemail = recipientemail
  this.fullName = fullName
  this.useAutomatedService = useAutomatedService
  this.areaName = areaName
  this.psoEmailAddress = psoEmailAddress
  if (polygon) {
    this.polygon = polygon
  }
}

module.exports = FloodRiskExpandedViewModel
