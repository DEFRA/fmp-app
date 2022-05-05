function ApplicationReviewSummaryViewModel (data) {
  if (data && data.PDFinformationDetailsObject) {
    this.PDFinformationDetailsObject = data.PDFinformationDetailsObject
    this.contacturl = data.contacturl
    this.confirmlocationurl = data.confirmlocationurl
  }
}
module.exports = ApplicationReviewSummaryViewModel
