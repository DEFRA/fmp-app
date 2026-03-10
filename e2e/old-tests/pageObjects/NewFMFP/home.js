'use strict'

class Home {
  // LOCATORS
//  get pageTitle () { return $('head > title') }
  get pageTitle () { return $("//h1[@class='govuk-heading-xl']") }
  get useThisServiceText () { return $("//p[contains(.,'Use this service to get flood risk information for planning applications (also known as')]") }
  get inconsistentMsg () { return $("//p[contains(.,'In some locations the rivers and sea supporting data may show inconsistent results.')]") } // FCRM-5899
  get withoutGuarantees () { return $("//p[contains(.,'The material displayed in this service, including maps and risk data, is provided without any guarantees,')]") }
  get differentServicesText () { return $("//p[contains(.,'There are different services to get information on the')]") }
  get floodRiskInScotlandLinkText () { return $("//a[contains(.,'flood risk in Scotland')]") }
  get floodRiskInWalesLinkText () { return $("//a[contains(.,'flood risk in Wales')]") }
  get floodRiskInNorthernIrelandLinkText () { return $("//a[contains(.,'flood risk in Northern Ireland')]") }
  get findOutMoreAboutFloodRiskLinkText () { return $("//a[contains(.,'Find out more about flood risk assessments for planning permission')]") }
  get contactTheEnironmentAgencyLinkText () { return $("//a[contains(.,'contact the Environment Agency')]") }
  get findOutAboutCallChargesLinkText () { return $("//a[contains(.,'Find out about call charges')]") }
  get environmentAgencyTelephoneText () { return $("//p[contains(.,'Telephone: 03708 506 506')]") }
  get environmentAgencyTimingText () { return $("//p[contains(.,'Monday to Friday, 8am to 6pm')]") }
  get startNowBtn () { return $('*=Start now') }

  // METHODS AND FUNCTIONS

  async getStartnowPageHeader () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async verifyAllComponents () {
    await console.log('Started Verifying all the page components')
    await this.useThisServiceText.waitForExist({ timeout: 5000 })
    //await this.inconsistentMsg.waitForExist({ timeout: 5000 })
    await this.withoutGuarantees.waitForExist({ timeout: 5000 })

    expect(await this.differentServicesText.isDisplayed()).toBe(true)
    expect(await this.floodRiskInScotlandLinkText.isDisplayed()).toBe(true)
    expect(await this.floodRiskInWalesLinkText.isDisplayed()).toBe(true)
    expect(await this.floodRiskInNorthernIrelandLinkText.isDisplayed()).toBe(true)
    expect(await this.floodRiskInNorthernIrelandLinkText.isDisplayed()).toBe(true)
    expect(await this.startNowBtn.isDisplayed()).toBe(true)
    expect(await this.findOutMoreAboutFloodRiskLinkText.isDisplayed()).toBe(true)
    expect(await this.contactTheEnironmentAgencyLinkText.isDisplayed()).toBe(true)
    expect(await this.findOutAboutCallChargesLinkText.isDisplayed()).toBe(true)
    expect(await this.environmentAgencyTelephoneText.isDisplayed()).toBe(true)
    expect(await this.environmentAgencyTimingText.isDisplayed()).toBe(true)
    await console.log('Verified all the page components')
  }

  async selectStartNow () {
    const elem = await this.startNowBtn
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async clickOnFloodRiskInfoScotlandLink () {
    const elem = await this.floodRiskInScotlandLinkText
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async clickOnFloodRiskInfoWalesink () {
    const elem = await this.floodRiskInWalesLinkText
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async clickOnFloodRiskInfoNorthernIrelandLink () {
    const elem = await this.floodRiskInNorthernIrelandLinkText
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async clickOnFindOutMoreAboutFloodRiskLink () {
    const elem = await this.findOutMoreAboutFloodRiskLinkText
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async clickOnContactTheEnvironmentAgencyLink () {
    const elem = await this.contactTheEnironmentAgencyLinkText
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async clickOnFindOutAboutCallChargesLink () {
    const elem = await this.findOutAboutCallChargesLinkText
    await elem.scrollIntoView()
    return await (await elem.click())
  }
}

module.exports = new Home()
