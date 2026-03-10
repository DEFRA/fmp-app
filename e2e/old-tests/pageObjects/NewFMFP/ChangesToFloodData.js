'use strict'

class ChangesToFloodData {
  // LOCATORS
  get pageTitle () { return $('h1[class=\'govuk-heading-xl\']') }
  get continueButton () { return $("//a[@href='/location']") }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getChangesToFloodDataPageHeader () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async selectContinueButton () {
    const elem = await this.continueButton
    await elem.scrollIntoView()
    return await (await elem.click())
  }
}

module.exports = new ChangesToFloodData()
