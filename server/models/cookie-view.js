function CookieViewModel (data) {
  if (data) {
    this.isYesChecked = data.isYesChecked
    this.isNoChecked = data.isNoChecked
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}

module.exports = CookieViewModel
