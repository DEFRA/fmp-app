function ConfirmLocationViewModel (easting, northing, polygon, location, placeOrPostcode) {
  this.easting = easting
  this.northing = northing
  this.polygon = JSON.stringify(polygon)
  this.location = location
  this.placeOrPostcode = placeOrPostcode
}

module.exports = ConfirmLocationViewModel
