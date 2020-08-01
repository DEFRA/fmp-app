function FloodRiskLocationViewModel (psoEmailAddress, areaName, zone) {
  if (psoEmailAddress) {
    this.psoEmailAddress = psoEmailAddress
  }
  if (areaName) {
    this.areaName = areaName
  }
  if (zone) {
    this.zone = zone
  }
}
module.exports = FloodRiskLocationViewModel
