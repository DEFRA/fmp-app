'use strict'

class ConfirmLocation {
  // Selectors
  // Confirm Location Heading
  get pageTitle () { return $('h1[class=\'govuk-heading-xl\']') }
  get continueBtn () { return $('a[href*=\'flood-zone\']') }
  get instructionToDrawLink () { return $('summary [class=\'govuk-details__summary-text\']') }
  get stepsToDraw () { return $('#confirm-location-page ol >li:nth-child(1)') }
  get drawBoundaryRdoOption () { return $('#polygon') }
  get moveMarker () { return $('#marker') }
  get callChargeLink () { return $('a[href*=\'https://www.gov.uk/call-charges\']') }
  get backLinkElement () { return $('.govuk-back-link') }
  get yourSearchDetailsParagraph () { return $('p.your-search-details') }

  // Functions
  // Retrieve the page Title and Validate that correct Page title is displayed
  async getPageTitle () {
    const element = await this.pageTitle
    return await (await element.getText())
  }

  async getCallChargeLinkText () {
    const element = await this.callChargeLink
    return await (await element.getText())
  }

  async selectContinue () {
    await (await this.continueBtn).click()
  }

  async selectInstructionsToDrawLink () {
    await (await this.instructionToDrawLink).click()
  }

  async getfirstStepText () {
    const element = await this.stepsToDraw
    return await (await element.getText())
  }

  async selectDrawBoundary () {
    await (await this.drawBoundaryRdoOption).click()
  }

  async selectMoveMarker () {
    await (await this.moveMarker).click()
  }

  async clickBackLink () {
    await (await this.backLinkElement).click()
  }

  async getYourSearchDetailsParagraphText () {
    const element = await this.yourSearchDetailsParagraph
    return await (await element.getText())
  }
}

module.exports = new ConfirmLocation()
