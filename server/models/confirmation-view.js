function ConfirmationViewModel (email, applicationReferenceNumber, EmailAddress, AreaName, LocalAuthorities) {
  if (email) {
    this.email = email
    this.EmailAddress = EmailAddress
    this.AreaName = AreaName
    this.LocalAuthorities = LocalAuthorities
  }
  if (applicationReferenceNumber) {
    this.applicationReferenceNumber = applicationReferenceNumber.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '')
  }
}
module.exports = ConfirmationViewModel
