'use strict'

class Home {
  // LOCATORS
  get pageTitle () { return $('head > title') }
  get checkForFloodingLink () { return $('*=check for flooding') }
  get findMoreAboutLink () { return $('a[href*=\'#when-you-need-an-assessment\']') }
  get contactUsLink () { return $('a[href*=\'#contact\']') }
  get callChargesLink () { return $('a[href*=\'call-charges\']') }
  get walesScotlandNorthernIrelandLink () { return $('*=Get flood risk information') }
  get startNowBtn () { return $('a[href=\'location\']') }

  // METHODS AND FUNCTIONS
  async selectNotEngland () {
    const elem = await this.walesScotlandNorthernIrelandLink
    return await (await elem.click())
  }

  async selectStartNow () {
    const elem = await this.startNowBtn
    return await (await elem.click())
  }

  async getCheckForFloodingLink () {
    const element = await this.checkForFloodingLink
    return await (await element.getAttribute('href'))
  }

  async getMoreAboutFloodRiskAssessmentLink () {
    const element = await this.findMoreAboutLink
    return await (await element.getAttribute('href'))
  }

  async getContactUsLink () {
    const element = await this.contactUsLink
    return await (await element.getAttribute('href'))
  }

  async getCallChargesLink () {
    const element = await this.callChargesLink
    return await (await element.getAttribute('href'))
  }
}

module.exports = new Home()
