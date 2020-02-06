function ContactAndPDFInformationObjectViewModel (data, errors) {
  if (data) {
    this.fullName = data.fullName
    this.email = data.email
    this.PDFinformationDetailsObject = data.PDFinformationDetailsObject
  }

  if (errors) {
    this.errors = {}

    // Full Name
    const fullNameErrors = errors.find(e => e.path[0] === 'fullName')
    if (fullNameErrors) {
      this.errors.fullName = 'You need to provide a full Name'
    }

    // Email
    const emailErrors = errors.find(e => e.path[0] === 'email')
    if (emailErrors) {
      this.errors.email = 'You need to provide an email address'
    }
  }
}

module.exports = ContactAndPDFInformationObjectViewModel
