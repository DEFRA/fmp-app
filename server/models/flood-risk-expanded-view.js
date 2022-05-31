
function FloodRiskExpandedViewModel (easting, northing, location, zone, localAuthorities, polygon, localViewVariables) {
  const { zoneNumber, recipientemail, fullName, useAutomatedService } = localViewVariables
  this.easting = easting
  this.northing = northing
  this.location = location
  this.zone = zone
  this.localAuthorities = localAuthorities
  this.zoneNumber = zoneNumber
  this.recipientemail = recipientemail
  this.fullName = fullName
  this.useAutomatedService = useAutomatedService
  if (polygon) {
    this.polygon = polygon
  }
}

module.exports = FloodRiskExpandedViewModel
