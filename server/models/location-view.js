function LocationViewModel (data) {
  if (data) {
    this.errorSummary = data.errorSummary
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}

module.exports = LocationViewModel
