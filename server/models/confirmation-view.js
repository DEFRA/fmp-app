function ConfirmationViewModel (
  recipientemail,
  applicationReferenceNumber,
  psoEmailAddress,
  AreaName,
  LocalAuthorities,
  zoneNumber,
  easting,
  northing,
  polygon,
  cent,
  location,
  search
) {
  if (recipientemail) {
    this.recipientemail = recipientemail
    this.psoEmailAddress = psoEmailAddress
    this.AreaName = AreaName
    this.LocalAuthorities = LocalAuthorities
    this.zoneNumber = zoneNumber
    this.easting = easting
    this.northing = northing
    this.ispolygon = false
    this.polygon = polygon
    this.cent = cent
    this.location = location
    this.search = search
  }
  if (applicationReferenceNumber) {
    this.applicationReferenceNumber = applicationReferenceNumber.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '')
  }
}
module.exports = ConfirmationViewModel
