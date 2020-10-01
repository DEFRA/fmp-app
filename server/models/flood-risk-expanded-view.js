
function FloodRiskExpandedViewModel (easting, northing, zone, localAuthorities, polygon) {
  this.easting = easting
  this.northing = northing
  this.zone = zone
  this.localAuthorities = localAuthorities
  if (polygon) {
    this.polygon = polygon
  }
}
module.exports = FloodRiskExpandedViewModel
