'use strict'

class Contact {
  // LOCATORS
  get pageTitle () { return $("//div[@id='contact-page']//h1") }
  get pageHeader () { return $("//div[@id='contact-page']//h1") }
  get pageBodyText () { return $("//div[@id='contact-page']//p[1]") }
  get pageBodyText2 () { return $("//div[@id='contact-page']//p[2]") }
  get pageList () { return $("//div[@id='contact-page']//ul/li") }
  get pageBodyText3 () { return $("//div[@id='contact-page']//p[3]") }
  get pageBodyText4 () { return $("//div[@id='contact-page']//p[4]") }
  get fullName () { return $('#fullName') }
  get email () { return $('#recipientemail') }
  get continueBtn () { return $('#contact-page form button') }
  // get errorSummaryTitle () { return $('#error-summary-title') }
  // get fullNameErrMsg () { return $('#fullName-error') }
  // get emailErrMsg () { return $('#recipientemail-error') }

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

  async isContactPageHeader_Displayed () {
    const element = await this.pageHeader
    await element.waitForExist({ timeout: 5000 })
    const elementText = await element.getText()
    const expText = 'Order your flood risk data'
    console.log('contact page header:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  async isContactPageBodyText_Displayed () {
    const element = await this.pageBodyText
    const elementText = await element.getText()
    const expText = 'Order detailed flood risk information to be used for a flood risk assessment as part of a planning application. This data is also known as a product 4.'
    console.log('contact page body text:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  // function to verify that full name textbox is present
  async isFullNameTextBox_Displayed () {
    const element = await this.fullName
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  // function to verify that email textbox is present
  async isEmailTextBox_Displayed () {
    const element = await this.email
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  // function to verify that continue button is present
  async isContinueButton_Displayed () {
    const element = await this.continueBtn
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  // fnction to verify that all the components are present in the contact page
  async isAllComponents_Displayed () {
    const element = await this.pageList
    await element.waitForExist({ timeout: 5000 })
    return await expect(element).toBeDisplayed()
  }

  async ContactPageDetails_Displayed () {
    await this.isContactPageHeader_Displayed()
    await this.isContactPageBodyText_Displayed()
    await this.isFullNameTextBox_Displayed()
    await this.isEmailTextBox_Displayed()
    await this.isContinueButton_Displayed()
  }

  async enterFullName (name) {
    const element = await this.fullName
    await element.waitForExist({ timeout: 5000 })
    await (await this.fullName).setValue(name)
  }

  async enterEmail (emailId) {
    return await (await this.email).setValue(emailId)
  }

  async selectContinue () {
    await this.continueBtn.scrollIntoView()
    return await (await this.continueBtn).click()
  }
}

module.exports = new Contact()
