function ApplicationReviewSummaryViewModel (data) {
  if (data && data.PDFinformationDetailsObject) {
    this.PDFinformationDetailsObject = data.PDFinformationDetailsObject
  }
}
module.exports = ApplicationReviewSummaryViewModel
