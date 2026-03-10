'use strict'

class Triage {
  // LOCATORS
  get pageTitle () { return $("h1[class='govuk-fieldset__heading']") }
  get allOptions () { return $('//div[@class=\'govuk-radios__item\']') }
  get allOptios () { return $('//div[@class=\'govuk-radios__item\']') }

  get forPlanningOption () { return $("//*[@id='location']") }
  get forPlanningText () { return $("//label[@for='location']") }
  get forPlanningHintText () { return $('#location-item-hint') }

  get forBuyingSellingOption () { return $("//*[@id='buy-sell']") }
  get forBuyingSellingText () { return $("//label[@for='buy-sell']") }
  get forBuyingSellingHintText () { return $('#buy-sell-item-hint') }

  get forFloodHistoryOption () { return $("//*[@id='flood-history']") }
  get forFloodHistoryText () { return $("//label[@for='flood-history']") }
  get forFloodHistoryHintText () { return $('#flood-history-item-hint') }

  get forInsuranceOption () { return $("//*[@id='insurance']") }
  get forInsuranceText () { return $("//label[@for='insurance']") }
  get forInsuranceHintText () { return $('#insurance-item-hint') }

  get forOtherOption () { return $("//*[@id='other']") }
  get forOtherText () { return $("//label[@for='other']") }
  get forOtherHintText () { return $('#other-item-hint') }

  get errorSummary () { return $("//div[@class='govuk-error-summary']") }
  get errorSummayTitle () { return $("//h2[@class='govuk-error-summary__title']") }
  get errormessage () { return $("//ul[@class='govuk-list govuk-error-summary__list']/li/a") }

  get continueButton () { return $("//button[@type='submit']") }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getTriagePageHeader () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async verifyAllComponents () {
    await console.log('Started Verifying all the page components')
    await this.pageTitle.waitForExist({ timeout: 5000 })

    // Verify "For planning purposes or scoping a site" option, Text and Hint Text
    await this.forPlanningOption.waitForExist({ timeout: 5000 })
    expect(await this.forPlanningText.isDisplayed()).toBe(true)
    await expect(await this.forPlanningText.getText()).toContain('For planning purposes or scoping a site')
    expect(await this.forPlanningHintText.isDisplayed()).toBe(true)
    await expect(await this.forPlanningHintText.getText()).toContain('You will be taken to the flood map for planning service')

    // Verify "For buying, selling or valuing a property" option, Text and Hint Text
    await this.forBuyingSellingOption.waitForExist({ timeout: 5000 })
    expect(await this.forBuyingSellingText.isDisplayed()).toBe(true)
    await expect(await this.forBuyingSellingText.getText()).toContain('For buying, selling or valuing a property')
    expect(await this.forBuyingSellingHintText.isDisplayed()).toBe(true)
    await expect(await this.forBuyingSellingHintText.getText()).toContain('You will be taken to the check your long term flood risk service')

    // Verify "To check if an area has flooded in the past" option, Text and Hint Text
    await this.forFloodHistoryOption.waitForExist({ timeout: 5000 })
    expect(await this.forFloodHistoryText.isDisplayed()).toBe(true)
    // await expect(await this.forFloodHistoryText.getText()).toContain('To check if an area has flooded in the past')
    await expect(await this.forFloodHistoryText.getText()).toContain('To find out if your property is in an area that has flooded')
    expect(await this.forFloodHistoryHintText.isDisplayed()).toBe(true)
    await expect(await this.forFloodHistoryHintText.getText()).toContain('You will be taken to information on how to request a flood history report')

    // Verify "For insurance purposes, to find out if I am at risk of flooding" option
    await this.forInsuranceOption.waitForExist({ timeout: 5000 })
    expect(await this.forInsuranceText.isDisplayed()).toBe(true)
    await expect(await this.forInsuranceText.getText()).toContain('For insurance purposes, to find out if I am at risk of flooding')
    expect(await this.forInsuranceHintText.isDisplayed()).toBe(true)
    await expect(await this.forInsuranceHintText.getText()).toContain('You will be taken to the check your long term flood risk service')

    // Verify "My reason is not listed here" option
    await this.forOtherOption.waitForExist({ timeout: 5000 })
    expect(await this.forOtherText.isDisplayed()).toBe(true)
    await expect(await this.forOtherText.getText()).toContain('My reason is not listed here')
    expect(await this.forOtherHintText.isDisplayed()).toBe(true)
    await expect(await this.forOtherHintText.getText()).toContain('Find other flood information on GOV.UK')

    // Verify Continue Button
    expect(await this.continueButton.isDisplayed()).toBe(true)
    await console.log('Verified all the page components')
  }

  async selectContinueButton () {
    const elem = await this.continueButton
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async selectForPlanningPurposeOption () {
    const elem = await this.forPlanningOption
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async selectForBuyingSellingOption () {
    const elem = await this.forBuyingSellingOption
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async selectForFloodHistoryOption () {
    const elem = await this.forFloodHistoryOption
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async selectForInsuranceOption () {
    const elem = await this.forInsuranceOption
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async selectForOtherPurposeOption () {
    const elem = await this.forOtherOption
    await elem.scrollIntoView()
    return await (await elem.click())
  }

  async isWarningMsgDisplayed () {
    await this.errorSummary.waitForExist({ timeout: 5000 })
    await this.errorSummary.scrollIntoView()
    await expect(await this.errorSummayTitle.getText()).toContain('There is a problem')
    // await expect(await this.errormessage.getText()).toContain('Please select an option to continue')
    await expect(await this.errormessage.getText()).toContain('Choose the flood information you need to continue') // FCRM-5777
    return true
  }
}

module.exports = new Triage()
