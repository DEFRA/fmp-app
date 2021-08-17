function ContactViewModel (data) {
  if (data) {
    this.errorSummary = data.errorSummary
    this.recipientemail = data.recipientemail
    this.emailError = data.emailError
    this.fullnameError = data.fullnameError
    this.fullName = data.fullName
    this.PDFinformationDetailsObject = data.PDFinformationDetailsObject
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}
module.exports = ContactViewModel
