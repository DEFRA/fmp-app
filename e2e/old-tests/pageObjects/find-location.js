'use strict'

class FindLocationPage {
  get pageTitle () { return $('#main-content h1[class=\'govuk-fieldset__heading\']') }
  get placePostcodeTextBox () { return $('input#placeOrPostcode') }
  get postcodeRdoBtn () { return $('input#findby') }
  get ngrRdoBtn () { return $('input#findby-2') }
  get ngrTextBox () { return $('input#nationalGridReference') }
  get eastingNorthingRdoBtn () { return $('input#findby-3') }
  get eastingTextBox () { return $('input#easting') }
  get northingTextBox () { return $('input#northing') }
  get continueBtn () { return $('#main-content  button') }
  get postcodeErrorMsg () { return $('#placeOrPostcode-error') }
  get ngrErrorMsg () { return $('#nationalGridReference-error') }
  get eastingErrorMsg () { return $('#easting-error') }
  get northingErrorMsg () { return $('#northing-error') }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async findLocationPostcode (postcode) {
    await (await this.postcodeRdoBtn).click()
    const placePostcodeTextBox = await this.placePostcodeTextBox
    await placePostcodeTextBox.click()
    await placePostcodeTextBox.setValue(postcode)
  }

  // Function to find Location by use of NGR number can be used for valid and Invalid Entries
  async findLocationNationalGridNumber (ngr) {
    await (await this.ngrRdoBtn).click()
    await (await this.ngrTextBox).setValue(ngr)
  }

  // Function to find location using the easting and northing of the location - Can be used with both valid and invalid entries
  async findLocationEastingNorthing (easting, northing) {
    await (await this.eastingNorthingRdoBtn).click()
    await (await this.eastingTextBox).setValue(easting)
    await (await this.northingTextBox).setValue(northing)
  }

  async selectContinue () {
    await (await this.continueBtn).click()
  }

  async getPlacePostcodeError () {
    const element = await this.postcodeErrorMsg
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getNGRError () {
    const element = await this.ngrErrorMsg
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getEastingError () {
    const element = await this.eastingErrorMsg
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getNorthingError () {
    const element = await this.northingErrorMsg
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async browseToLocationPage () {
    await browser.url('/location')
    await expect(browser).toHaveUrl(`${browser.options.baseUrl}/location`)
    return await expect(browser).toHaveTitle('Find location - Flood map for planning - GOV.UK')
  }
}

module.exports = new FindLocationPage()
