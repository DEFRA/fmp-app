'use strict'

class PrivacyNotice {
  // LOCATORS
  get pageTitle () { return $('h1[class=\'govuk-heading-xl\']') }
  get generalGDPR () { return $('a[href*=\'general-data\']') }
  get DPA () { return $('p:nth-child(2) > a[href$=\'data-protection\']') }
  get privacyPolicy () { return $('a[href*=\'personal-information-charter\']') }
  get cookies () { return $('a[href$=\'cookies\']') }
  get webBrowser () { return $('a[href*=\'browsers\']') }
  get EEA () { return $('a[href*=\'eu-eea\']') }
  get ico () { return $('a[href*=\'ico.org.uk\']') }
  get contactUs () { return $('p:nth-child(26) > a') }
  get govUKVerify () { return $('a[href*=\'introducing-govuk-verify\']') }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getGDPRLink () {
    const element = await this.generalGDPR
    return await (await element.getAttribute('href'))
  }

  async getDPALink () {
    const element = await this.DPA
    return await (await element.getAttribute('href'))
  }

  async getPrivacyPolicyLink () {
    const element = await this.privacyPolicy
    return await (await element.getAttribute('href'))
  }

  async getCookiesLink () {
    const element = await this.cookies
    return await (await element.getAttribute('href'))
  }

  async getWebBrowserLink () {
    const element = await this.webBrowser
    return await (await element.getAttribute('href'))
  }

  async getEEALink () {
    const element = await this.EEA
    return await (await element.getAttribute('href'))
  }

  async getICOLink () {
    const element = await this.ico
    return await (await element.getAttribute('href'))
  }

  async getContactUsLink () {
    const element = await this.contactUs
    return await (await element.getAttribute('href'))
  }

  async getGOVUKVerifyLink () {
    const element = await this.govUKVerify
    return await (await element.getAttribute('href'))
  }
}

module.exports = new PrivacyNotice()
