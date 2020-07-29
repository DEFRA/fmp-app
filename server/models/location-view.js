function LocationViewModel (data) {
  if (data) {
    this.errorSummary = data.errorSummary
    this.placeOrPostcodeSelected = data.placeOrPostcodeSelected
    this.nationalGridReferenceSelected = data.nationalGridReferenceSelected
    this.eastingNorthingSelected = data.eastingNorthingSelected
    this.placeOrPostcodeError = data.placeOrPostcodeError
    this.nationalGridReferenceError = data.nationalGridReferenceError
    this.eastingError = data.eastingError
    this.northingError = data.northingError
    this.placeOrPostcode = data.placeOrPostcode
    this.nationalGridReference = data.nationalGridReference
    this.northing = data.northing
    this.easting = data.easting
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}

module.exports = LocationViewModel
