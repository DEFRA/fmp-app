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
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}

module.exports = LocationViewModel
