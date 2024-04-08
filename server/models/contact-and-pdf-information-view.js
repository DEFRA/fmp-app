function ContactAndPDFInformationObjectViewModel (data, errors) {
  if (data) {
    this.fullName = data.fullName
    this.recipientemail = data.recipientemail
    this.PDFinformationDetailsObject = data.PDFinformationDetailsObject
  }

  if (errors) {
    this.errors = {}

    // Full Name
    const fullNameErrors = errors.find((e) => e.path[0] === 'fullName')
    if (fullNameErrors) {
      this.errors.fullName = 'You need to provide a full Name'
    }

    // Email
    const emailErrors = errors.find((e) => e.path[0] === 'recipientemail')
    if (emailErrors) {
      this.errors.recipientemail = 'You need to provide an email address'
    }
  }
}

module.exports = ContactAndPDFInformationObjectViewModel
