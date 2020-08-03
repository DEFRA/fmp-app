function ContactViewModel (data) {
  if (data) {
    this.errorSummary = data.errorSummary
    this.email = data.email
    this.emailError = data.emailError
    this.fullnameError = data.fullnameError
    this.fullname = data.fullname
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}
module.exports = ContactViewModel
