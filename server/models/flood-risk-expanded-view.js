
function FloodRiskExpandedViewModel (easting, northing, location, zone, localAuthorities, polygon, zoneNumber, recipientemail, fullName) {
  this.easting = easting
  this.northing = northing
  this.location = location
  this.zone = zone
  this.localAuthorities = localAuthorities
  this.zoneNumber = zoneNumber
  this.recipientemail = recipientemail
  this.fullName = fullName
  if (polygon) {
    this.polygon = polygon
  }
}

module.exports = FloodRiskExpandedViewModel
