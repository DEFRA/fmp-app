'use strict'

class TermsConditions {
  // LOCATORS
  get pageTitle () { return $('#title') }
  get contactUs () { return $('#terms-and-conditions p:nth-child(12) > a') }
  get informationAct () { return $('#terms-and-conditions p:nth-child(33) > a') }
  get dataProtectionAct () { return $('#terms-and-conditions p:nth-child(33) > a:nth-child(2)') }
  get privacyPolicy () { return $('a[href*=\'personal-information-charter\']') }
  get cookies () { return $('a[href$=\'cookies\']') }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getPrivacyPolicyLink () {
    const element = await this.privacyPolicy
    return await (await element.getAttribute('href'))
  }

  async getCookiesLink () {
    const element = await this.cookies
    return await (await element.getAttribute('href'))
  }

  async getContactUsLink () {
    const element = await this.contactUs
    return await (await element.getAttribute('href'))
  }

  async getInformationActLink () {
    const element = await this.informationAct
    return await (await element.getAttribute('href'))
  }

  async getDataProtectionActLink () {
    const element = await this.dataProtectionAct
    return await (await element.getAttribute('href'))
  }
}

module.exports = new TermsConditions()
