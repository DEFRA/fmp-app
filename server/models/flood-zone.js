function FloodZoneModel (risk, polygon,useAutomatedService) {
  this.isAreaBenefiting = false
  this.isZone3 = false
  this.isZone2 = false
  this.isZone1 = false
  // Set the points flood zone (centroid)
  if (!polygon) {
    if (risk.areas_benefiting) {
      this.isAreaBenefiting = true
      this.zone = 'FZ3a'
    } else if (risk.floodzone_3) {
      this.isZone3 = true
      this.zone = 'FZ3'
    } else if (risk.floodzone_2) {
      this.isZone2 = true
      this.zone = 'FZ2'
    } else {
      !useAutomatedService ? this.isZone1 = true : this.isZone1 = false
      this.zone = 'FZ1'
    }
  } else { // Set points for flood zone (polygon)
    if (risk.floodzone_3) {
      // Check if AB coverage of FZ3 is > 99.9% due to some small spikes on data
      if (risk.areas_benefiting && risk.fz3_ab_coverage >= 99.9) {
        this.isAreaBenefiting = true
        this.zone = 'FZ3a'
      } else {
        this.isZone3 = true
        this.zone = 'FZ3'
      }
    } else if (risk.areas_benefiting) {
      this.isAreaBenefiting = true
      this.zone = 'FZ3a'
    } else if (risk.floodzone_2) {
      this.isZone2 = true
      this.zone = 'FZ2'
    } else {
      !useAutomatedService ? this.isZone1 = true : this.isZone1 = false
      this.zone = 'FZ1'
    }
  }
}

module.exports = FloodZoneModel
