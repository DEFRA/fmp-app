function ConfirmLocationViewModel (easting, northing, polygon, location) {
  this.easting = easting
  this.northing = northing
  this.polygon = JSON.stringify(polygon)
  this.location = location
}

module.exports = ConfirmLocationViewModel
