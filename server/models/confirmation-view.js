function ConfirmationViewModel (email, applicationReferenceNumber) {
  if (email) {
    this.email = email
  }
  if (applicationReferenceNumber) {
    this.applicationReferenceNumber = applicationReferenceNumber.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '')
  }
}
module.exports = ConfirmationViewModel
