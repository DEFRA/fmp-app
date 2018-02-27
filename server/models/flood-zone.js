function FloodZoneModel (risk, polygon) {
  this.isAreaBenefiting = false
  this.isZone3 = false
  this.isZone2 = false
  this.isZone1 = false
  // Set the points flood zone (centroid)
  if (!polygon) {
    if (risk.areas_benefiting && risk.floodzone_3) {
      this.isAreaBenefiting = true
      this.zone = 'FZ3a'
    } else if (risk.floodzone_3) {
      this.isZone3 = true
      this.zone = 'FZ3'
    } else if (risk.floodzone_2) {
      this.isZone2 = true
      this.zone = 'FZ2'
    } else {
      this.isZone1 = true
      this.zone = 'FZ1'
    }
  } else { // Set points for flood zone (polygon)
    if (risk.floodzone_3) {
      this.isZone3 = true
      this.zone = 'FZ3'
    } else if (risk.areas_benefiting) {
      this.isAreaBenefiting = true
      this.zone = 'FZ3a'
    } else if (risk.floodzone_2) {
      this.isZone2 = true
      this.zone = 'FZ2'
    } else {
      this.isZone1 = true
      this.zone = 'FZ1'
    }
  }
}

module.exports = FloodZoneModel
