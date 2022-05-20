const FloodZone = require('./flood-zone')

function FloodRiskViewModel (psoEmailAddress, areaName, risk, center, polygon, location, variables) {
  const {placeOrPostcode, recipientemail, fullName, useAutomatedService} = variables
  if (psoEmailAddress) {
    this.psoEmailAddress = psoEmailAddress
  }
  if (areaName) {
    this.areaName = areaName
  }

  if (recipientemail) {
    this.recipientemail = recipientemail
  }
  if (fullName) {
    this.fullName = fullName
  }
  if (polygon) {
    this.polygon = JSON.stringify(polygon)
    this.center = JSON.stringify(center)
  }

  if (location) {
    this.location = location
  }
  if (placeOrPostcode) {
    this.placeOrPostcode = placeOrPostcode
  }
  this.useAutomatedService = useAutomatedService

  this.easting = center[0]
  this.northing = center[1]

  this.floodZone = new FloodZone(risk, !!polygon)
  if (this.floodZone.zone === 'FZ1') {
    this.zoneNumber = '1'
  } else if (this.floodZone.zone === 'FZ2') {
    this.zoneNumber = '2'
  } else if (this.floodZone.zone === 'FZ3') {
    this.zoneNumber = '3'
  } else if (this.floodZone.zone === 'FZ3a') {
    this.zoneNumber = '3 in an area benefitting from flood defences'
  } else {
    this.zoneNumber = 'not available'
  }

  // Provide test data for e2e tests
  this.riskJSON = JSON.stringify(risk)
}
module.exports = FloodRiskViewModel
