const FloodZone = require('./flood-zone')

function FloodRiskViewModel (psoEmailAddress, areaName, risk, center, polygon) {
  if (psoEmailAddress) {
    this.psoEmailAddress = psoEmailAddress
  }
  if (areaName) {
    this.areaName = areaName
  }
  if (polygon) {
    this.polygon = JSON.stringify(polygon)
    this.center = JSON.stringify(center)
  }

  this.easting = center[0]
  this.northing = center[1]

  this.floodZone = new FloodZone(risk, !!polygon)

  // Provide test data for e2e tests
  this.riskJSON = JSON.stringify(risk)
}
module.exports = FloodRiskViewModel
