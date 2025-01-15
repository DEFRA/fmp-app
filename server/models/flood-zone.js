function FloodZoneModel (risk) {
  this.isZone3 = false
  this.isZone2 = false
  this.isZone1 = false
  // Set the points flood zone (centroid)
  if (risk.floodzone_3) {
    this.zone = 'FZ3'
  } else if (risk.floodzone_2) {
    this.zone = 'FZ2'
  } else {
    this.zone = 'FZ1'
  }
}

module.exports = FloodZoneModel
