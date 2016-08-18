function SummaryView (easting, northing, risk) {
  this.easting = easting
  this.northing = northing
  this.riskJSON = JSON.stringify(risk)
}

module.exports = SummaryView
