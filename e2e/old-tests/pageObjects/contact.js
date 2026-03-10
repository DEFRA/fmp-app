'use strict'

class Contact {
  // LOCATORS
  get pageTitle () { return $('#contact-page h1[class=\'govuk-fieldset__heading\']') }
  get fullName () { return $('#fullName') }
  get email () { return $('#recipientemail') }
  get continueBtn () { return $('#contact-page form button') }
  get errorSummaryTitle () { return $('#error-summary-title') }
  get fullNameErrMsg () { return $('#fullName-error') }
  get emailErrMsg () { return $('#recipientemail-error') }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async enterFullName (name) {
    const element = await this.fullName
    await element.waitForExist({ timeout: 5000 })
    await (await this.fullName).setValue(name)
  }

  async enterEmail (emailId) {
    return await (await this.email).setValue(emailId)
  }

  async selectContinue () {
    return await (await this.continueBtn).click()
  }

  async getFullNameErrorMsg () {
    const element = await this.fullNameErrMsg
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getEmailErrorMsg () {
    const element = await this.emailErrMsg
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }
}

module.exports = new Contact()
