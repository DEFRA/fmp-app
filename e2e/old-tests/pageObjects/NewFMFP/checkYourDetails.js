'use strict'

class CheckYourDetails {
  // LOCATORS
  get pageTitle () { return $("//div[@id='check-your-details-page']//h1") }
  get pageHeader () { return $("//div[@id='check-your-details-page']//h1") }
  get pageBodyText () { return $("//div[@id='check-your-details-page']//p[1]") }
  get pageBodyText2 () { return $("//div[@id='check-your-details-page']//p[2]") }

  get nameLabel () { return $("//dl//div/dt[contains(text(),'Name')]") }
  get nametext () { return $("//dl//div/dt[contains(text(),'Name')]/../dd[1]") }
  get nameChangeLink () { return $("//dl//div/dt[contains(text(),'Name')]/../dd[2]") }

  get emailLabel () { return $("//dl//div/dt[contains(text(),'Email address')]") }
  get emailText () { return $("//dl//div/dt[contains(text(),'Email address')]/../dd[1]") }
  get emailChangeLink () { return $("//dl//div/dt[contains(text(),'Email address')]/../dd[2]") }

  get locationLabel () { return $("//dl//div/dt[contains(text(),'Location')]") }
  get locationImage () { return $("//dl//div/dt[contains(text(),'Location')]/../dd[1]") }
  get locationChangeLink () { return $("//dl//div/dt[contains(text(),'Location')]/../dd[2]") }

  get floodZoneLabel () { return $("//dl//div/dt[contains(text(),'Flood Zone')]") }
  get floodZoneText () { return $("//dl//div/dt[contains(text(),'Flood Zone')]/../dd[1]") }

  get OrderFloodRiskDataButton () { return $("//div[@id='check-your-details-page']//button[@type='submit']") }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  // function to verify that the page header is present
  async getPageHeader () {
    const element = await this.pageHeader
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async isCheckYourDetailsPageHeader_Displayed () {
    const element = await this.pageHeader
    await element.waitForExist({ timeout: 5000 })
    const elementText = await element.getText()
    const expText = 'Check your details before requesting your data'
    console.log('contact page header:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  async isCheckYourDetailsPageBodyText_Displayed () {
    const element = await this.pageBodyText
    const elementText = await element.getText()
    console.log('contact page body text:', elementText)
    const expText = 'After you have submitted your request you will not be able to change it. Make sure the site location is accurate.'
    return await expect(elementText).toEqual(expText)
  }

  // function to verify that full name is displayed
  async isFullName_Displayed () {
    const element = await this.nametext
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  // function to get the full name text
  async getFullNameText () {
    const element = await this.nametext
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  // funnctio to verify that email is displayed
  async isEmail_Displayed () {
    const element = await this.emailText
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  // function to get the email text
  async getEmailText () {
    const element = await this.emailText
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  // function to verify that flood zone is displayed
  async isFloodZone_Displayed () {
    const element = await this.floodZoneText
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  // function to verify that order flood risk data button is present
  async is_OrderFloodRiskDataButton_Displayed () {
    const element = await this.OrderFloodRiskDataButton
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  async CheckYourDetailsPageDetails_Displayed () {
    await this.isCheckYourDetailsPageHeader_Displayed()
    await this.isCheckYourDetailsPageBodyText_Displayed()
    await this.isFullName_Displayed()
    await this.isEmail_Displayed()
    await this.isFloodZone_Displayed()
  }
}

module.exports = new CheckYourDetails()
