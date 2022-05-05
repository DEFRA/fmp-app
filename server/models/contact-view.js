function ContactViewModel (data) {
  if (data) {
    this.errorSummary = data.errorSummary
    this.recipientemail = data.PDFinformationDetailsObject.recipientemail
    this.emailError = data.emailError
    this.fullnameError = data.fullnameError
    this.fullName = data.PDFinformationDetailsObject.fullName
    this.PDFinformationDetailsObject = data.PDFinformationDetailsObject
  } else {
    this.errors = {}
    this.errorSummary = this.errors
  }
}
module.exports = ContactViewModel
