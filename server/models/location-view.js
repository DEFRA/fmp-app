function LocationViewModel (data, errorSummary) {
  if (!data) {
    data = {
      findby: 'placeOrPostcode'
    }
  }
  this.errors = { placeOrPostcode: '', easting: '', northing: '', nationGridReferencenumber: '' }
  this.errorSummary = Object.values(this.errors)
}

module.exports = LocationViewModel
