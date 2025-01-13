function ConfirmationViewModel (
  recipientemail,
  applicationReferenceNumber,
  psoEmailAddress,
  AreaName,
  LocalAuthorities,
  zoneNumber,
  polygon
) {
  this.recipientemail = recipientemail
  this.psoEmailAddress = psoEmailAddress
  this.AreaName = AreaName
  this.LocalAuthorities = LocalAuthorities
  this.zoneNumber = zoneNumber
  this.polygon = polygon
  if (applicationReferenceNumber) {
    this.applicationReferenceNumber = applicationReferenceNumber.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '')
  }
}
module.exports = ConfirmationViewModel
