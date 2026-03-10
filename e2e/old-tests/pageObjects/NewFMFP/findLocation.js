'use strict'

class FindLocation {
  // LOCATORS
  get pageTitle () { return $("//h1[@class='govuk-fieldset__heading']") }

  get postcodeOptionText () { return $("//label[@for='findby']") }
  get postcodeRdoBtn () { return $("//input[@value='placeOrPostcode']") }
  get postcodeTextBox () { return $("//input[@id='placeOrPostcode']") }

  get ngrOptionText () { return $("//label[@for='findby-2']") }
  get ngrRdoBtn () { return $("//input[@value='nationalGridReference']") }
  get ngrTextBox () { return $("//input[@id='nationalGridReference']") }

  get eastingNorthingOptionText () { return $("//label[@for='findby-3']") }
  get eastingNorthingRdoBtn () { return $("//input[@value='eastingNorthing']") }
  get eastingTextBox () { return $("//input[@id='easting']") }
  get northingTextBox () { return $("//input[@id='northing']") }

  get continueButton () { return $("//button[@type='submit']") }

  async getFindLocationPageHeader () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  // Function to find location using the postcode of the location - Can be used with both valid and invalid entries
  async findLocationPostcode (postcode) {
    await console.log('inside find location postcode method')
    await (await this.postcodeRdoBtn).click()
    await this.postcodeTextBox.waitForExist({ timeout: 5000 })
    await this.postcodeTextBox.click()
    await this.postcodeTextBox.setValue(postcode)
  }

  // Function to find location using the easting and northing of the location - Can be used with both valid and invalid entries
  async findLocationEastingNorthing (easting, northing) {
    await (await this.eastingNorthingRdoBtn).click()
    await (await this.eastingTextBox).setValue(easting)
    await (await this.northingTextBox).setValue(northing)
  }

  async selectContinueButton () {
    const elem = await this.continueButton
    await elem.scrollIntoView()
    return await (await elem.click())
  }
}

module.exports = new FindLocation()
