function FloodZoneModel (risk) {
  this.isAreaBenefiting = false
  this.isZone3 = false
  this.isZone2 = false
  this.isZone1 = false
  // Set the points flood zone (centroid)
  this.isAreaBenefiting = false
  if (risk.floodzone_3) {
    this.zone = this.isAreaBenefiting ? 'FZ3a' : 'FZ3'
  } else if (risk.floodzone_2) {
    this.zone = this.isAreaBenefiting ? 'FZ2a' : 'FZ2'
  } else {
    this.zone = 'FZ1'
  }
}

module.exports = FloodZoneModel
