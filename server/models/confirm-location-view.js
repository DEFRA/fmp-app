function ConfirmLocationViewModel ({
  easting,
  northing,
  polygon,
  location,
  placeOrPostcode,
  recipientemail,
  fullName,
  locationDetails,
  contactDetails = {},
  polygonMissing = false
}) {
  const { AreaName, EmailAddress } = contactDetails
  this.easting = encodeURIComponent(easting)
  this.northing = encodeURIComponent(northing)
  this.polygon = encodeURIComponent(JSON.stringify(polygon))
  this.location = encodeURIComponent(location)
  this.placeOrPostcode = encodeURIComponent(placeOrPostcode)
  this.recipientemail = encodeURIComponent(recipientemail)
  this.fullName = encodeURIComponent(fullName)
  this.locationDetails = locationDetails
  this.placeOrPostcodeUnencoded = placeOrPostcode
  this.areaName = AreaName
  this.psoEmailAddress = EmailAddress
  this.polygonMissing = polygonMissing
}

module.exports = ConfirmLocationViewModel
