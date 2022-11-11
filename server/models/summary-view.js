const FloodZone = require('./flood-zone')

function SummaryView (risk, center, polygon) {
  if (polygon) {
    this.polygon = JSON.stringify(polygon)
    this.center = JSON.stringify(center)
  }

  this.easting = center[0]
  this.northing = center[1]

  this.floodZone = new FloodZone(risk)

  // Provide test data for e2e tests
  this.riskJSON = JSON.stringify(risk)
}

module.exports = SummaryView
