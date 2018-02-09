function ConfirmLocationViewModel (easting, northing, polygon) {
  this.easting = easting
  this.northing = northing
  this.polygon = JSON.stringify(polygon)
}

module.exports = ConfirmLocationViewModel
