
function FloodRiskExpandedViewModel (easting, northing, zone, localAuthorities, polygon, zoneNumber) {
  this.easting = easting
  this.northing = northing
  this.zone = zone
  this.localAuthorities = localAuthorities
  this.zoneNumber = zoneNumber
  if (polygon) {
    this.polygon = polygon
  }
}
module.exports = FloodRiskExpandedViewModel
