'use strict'

class PrivacyPolicy {
  // LOCATORS
  get pageTitle () { return $('#title') }
  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }
}

module.exports = new PrivacyPolicy()
