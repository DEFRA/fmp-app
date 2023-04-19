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
    if (data.errorSummary.length) {
      this.locationOptionForAnalytics = JSON.stringify({
        event: 'SEARCH',
        parameters: {
          ERROR: true,
          VALUE: this.placeOrPostcodeSelected
            ? this.placeOrPostcode
            : this.nationalGridReferenceSelected
              ? this.nationalGridReference
              : `${this.easting}_${this.northing}`,
          TYPE: this.placeOrPostcodeSelected
            ? 'PLACENAME'
            : this.nationalGridReferenceSelected
              ? 'NGR'
              : 'EASTINGS'
        }
      })
    }
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}

module.exports = LocationViewModel
