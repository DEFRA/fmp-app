function LocationViewModel (data) {
  if (data) {
    this.errorSummary = data.errorSummary
    this.placeOrPostcodeSelected = data.placeOrPostcodeSelected
    this.nationalGridReferenceSelected = data.nationalGridReferenceSelected
    this.eastingNorthingSelected = data.eastingNorthingSelected
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}

module.exports = LocationViewModel
