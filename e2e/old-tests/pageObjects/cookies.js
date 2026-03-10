'use strict'

class CookiePage {
  // LOCATORS
  get pageTitle () { return $('h1[class=\'heading-xlarge\']') }
  get yesRdoBtn () { return $('input#cookie_consent') }
  get noRdoBtn () { return $('input#cookies_consent-2') }
  get saveCookieBtn () { return $('button[class*=\'-margin-top-3\']') }

  // METHODS AND FUNCTIONS
  async getPageTitle () {
    const element = await this.pageTitle
    return await (await element.getText())
  }

  async selectYesRadioBtn () {
    await (await this.yesRdoBtn).isDisplayedInViewport()
    await (await this.yesRdoBtn).click()
  }

  async selectNoRadioBtn () {
    await (await this.noRdoBtn).isDisplayedInViewport()
    await (await this.noRdoBtn).click()
  }

  async selectSaveCookie () {
    await (await this.saveCookieBtn).isDisplayedInViewport()
    await (await this.saveCookieBtn).click()
  }
}
module.exports = new CookiePage()
