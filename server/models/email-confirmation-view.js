function EmailConfirmationViewModel(email, EmailAddress, AreaName, LocalAuthorities) {
  if (email) {
    this.email = email
    this.EmailAddress = EmailAddress
    this.AreaName = AreaName
    this.LocalAuthorities = LocalAuthorities

  }
}
module.exports = EmailConfirmationViewModel
