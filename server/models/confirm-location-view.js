function ConfirmLocationViewModel (easting, northing, polygon, location, placeOrPostcode) {
  this.easting = encodeURIComponent(easting)
  this.northing = encodeURIComponent(northing)
  this.polygon = encodeURIComponent(JSON.stringify(polygon))
  this.location = encodeURIComponent(location)
  this.placeOrPostcode = encodeURIComponent(placeOrPostcode)
}

module.exports = ConfirmLocationViewModel
