const FloodZone = require('./flood-zone')

function Model (data) {
  const {
    psoEmailAddress,
    areaName,
    risk,
    center,
    polygon,
    location,
    placeOrPostcode,
    useAutomatedService,
    plotSize,
    localAuthorities,
    surfaceWaterResults
  } = data
  this.localAuthorities = localAuthorities
  this.surfaceWaterResults = surfaceWaterResults

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

  if (location) {
    this.location = location
  }
  if (placeOrPostcode) {
    this.placeOrPostcode = placeOrPostcode
  }
  this.useAutomatedService = useAutomatedService

  this.easting = center[0]
  this.northing = center[1]

  this.floodZone = new FloodZone(risk)
  if (this.floodZone.zone === 'FZ1') {
    this.zoneNumber = '1'
  } else if (this.floodZone.zone === 'FZ2') {
    this.zoneNumber = '2'
  } else if (this.floodZone.zone === 'FZ2a') {
    this.zoneNumber = '2'
  } else if (this.floodZone.zone === 'FZ3') {
    this.zoneNumber = '3'
  } else if (this.floodZone.zone === 'FZ3a') {
    this.zoneNumber = '3'
  } else {
    this.zoneNumber = 'not available'
  }

  this.holdingComments = Boolean(risk.extra_info)

  // Provide test data for e2e tests
  this.riskJSON = JSON.stringify(risk)
  // Add a requestP1 event object
  // <div class="hide" data-journey='{"event":"REQUEST_P4","parameters":{"ZONE":"{{zoneNumber}}","AREA":"{{AreaName}}"}}'></div>
  this.analyticsRequestProduct1Event = JSON.stringify({
    event: 'REQUEST_P1',
    parameters: {
      ZONE: this.zoneNumber,
      AREA: this.areaName
    }
  })

  this.plotSize = plotSize !== '0' && plotSize !== 0 ? plotSize : 'less than 0.1'
}

module.exports = { Model }
