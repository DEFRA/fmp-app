'use strict'

class EnglandOnly {
  // LOCATORS
  get irelandLink () { return $('a[href*=\'nidirect.gov\']') }
  get walesLink () { return $('#not-england-page p a[href*=\'naturalresources.wales\')') }
  get scotlandLink () { return $('#not-england-page p a[href*=\'sepa\']') }
  get onlyEnglandTitle () { return $('#not-england-page h1') }
  get floodPlanningForEngland () { return $('p a[href=\'/\']') }

  async onlyEnglandText () {
    const elem = await this.onlyEnglandTitle
    return await (await elem.getText())
  }

  async getScotlandLink () {
    const elem = await this.scotlandLink
    return await (await elem.getText())
  }

  async checkScotlandLink () {
    const elem = await this.scotlandLink
    return await (await elem.getAttribute('href'))
  }

  async getNILink () {
    const elem = await this.irelandLink
    return await (await elem.getText())
  }

  async checkNILink () {
    const elem = await this.irelandLink
    return await (await elem.getAttribute('href'))
  }

  async selectFloodPlanningEnglandLink () {
    const elem = await this.floodPlanningForEngland
    return await elem.click()
  }
}

module.exports = new EnglandOnly()
