'use strict'

class AccessibilityStmt {
  // LOCATORS
  get pageTitle () { return $('#accessibility-page h1') }
  get pageContents () { return $('#accessibility-page') }
  get abilityNetLink () { return $('a[href*=\'ability\']') }
  get EASSLink () { return $('#accessibility-page') }
  get w3OrgLink () { return $('#accessibility-page') }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async checkAccessibilityContent () {
    const element = await this.pageContents
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }
}

module.exports = new AccessibilityStmt()
