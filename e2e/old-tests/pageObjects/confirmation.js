'use strict'

class Confirmation {
  // LOCATORS
  get requestConfirmationPanel () { return $('[class$=\'confirmation\'] ') }
  get requestStatus () { return $('#confirmation-page h1') }
  get referenceNumber () { return $('[class=\'govuk-panel__body\'] bold') }

  async getRequestStatus () {
    const element = await this.requestStatus
    return await (await element.getText())
  }

  async getReferenceNumber () {
    const element = await this.referenceNumber
    return await (await element.getText())
  }

  async requestAssessmentData () {
    const element = await this.requestAssessmentDataBtn
    return await (await element.click())
  }
}

module.exports = new Confirmation()
