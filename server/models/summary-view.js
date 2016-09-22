function SummaryView (easting, northing, risk) {
  this.easting = easting
  this.northing = northing
  this.isAreaBenefiting = false
  this.isZone3 = false
  this.isZone2 = false
  this.isZone1 = false

  // Set the points flood zone
  if (risk.areas_benefiting && risk.floodzone_3) {
    this.isAreaBenefiting = true
  } else if (risk.floodzone_3) {
    this.isZone3 = true
  } else if (risk.floodzone_2) {
    this.isZone2 = true
  } else {
    this.isZone1 = true
  }

  // Provide test data for e2e tests
  this.riskJSON = JSON.stringify(risk)
}

module.exports = SummaryView
