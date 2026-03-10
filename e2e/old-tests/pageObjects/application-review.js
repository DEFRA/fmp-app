'use strict'

class ApplicationReview {
  // LOCATORS
  get pageTitle () { return $('#check-your-details-page   form > fieldset > legend > h1') }
  get map () { return $('#map') }
  get requestAssessmentDataBtn () { return $('#check-your-details-page  form > button') }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async selectContinue () {
    const element = await this.continueBtn
    return await (await element.click())
  }

  async requestAssessmentData () {
    const element = await this.requestAssessmentDataBtn
    return await (await element.click())
  }
}

module.exports = new ApplicationReview()
