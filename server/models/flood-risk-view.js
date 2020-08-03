function FloodRiskLocationViewModel (data) {
  if (data.psoEmailAddress) {
    this.psoEmailAddress = data.psoEmailAddress
  }
  if (data.areaName) {
    this.areaName = data.areaName
  }
  if (data.zone) {
    this.zone = data.zone
  }
}
module.exports = FloodRiskLocationViewModel
