'use strict'
class FloodZoneResults {
  // LOCATORS
  get pageTitle () { return $('#summary-page h1[class=\'govuk-heading-xl\']') }
  get map () { return $('#map') }
  get mapScaleLiner () { return $('#map [class=\'ol-scale-line-inner\']') }
  get pageContents () { return $('main#main-content') }
  get downloadPdfBtn () { return $('button.govuk-button.govuk-button--secondary') }
  get reportDialog () { return $('#report [class=\'dialog-holder\']') }
  get referenceTxtBx () { return $('#reference') }
  get downloadDialogBtn () { return $('button[class=\'button\']') }
  get downloadingReport () { return $('#report-downloading') }
  get requestAssessmentData () { return $('#summary-page a[href*=\'/contact\']') }
  get searchDiffLocLink () { return $('#summary-page a[href=\'location\']') }
  get repositionMarkerLink () { return $('*=Redraw the boundary of your site') }
  get moreInformationAboutFloodZonesLink () { return $('*=flood zones and what they mean') }
  get longTermSurfaceWaterLink () { return $('a[href$=\'SurfaceWater\']') }
  get getEmailEnvironmentAgencyParagraph () { return $('p*=Email the Environment Agency team in') }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async getFloodZoneResultsContents () {
    const element = await this.pageContents
    return await (await element.getText())
  }

  async getDownloadButtonText () {
    const element = await this.downloadPdfBtn
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async selectDownloadPdf () {
    const element = await this.downloadPdfBtn
    return await (await element.click())
  }

  async enterDownloadReference (referenceText) {
    await (await this.referenceTxtBx).setValue(referenceText)
  }

  async selectDownloadDialog () {
    const element = await this.downloadDialogBtn
    return await (await element.click())
  }

  async selectRequestAssessmentData () {
    const element = await this.requestAssessmentData
    return await (await element.click())
  }

  async searchDiffLocation () {
    const element = await this.searchDiffLocLink
    return await (await element.click())
  }

  async repositionMarker () {
    const element = await this.repositionMarkerLink
    return await (await element.click())
  }

  async clickMoreInformationAboutFloodZonesLink () {
    const element = await this.moreInformationAboutFloodZonesLink
    return await (await element.click())
  }

  async selectLongTermSurfaceWaterLink () {
    const element = await this.longTermSurfaceWaterLink
    return await (await element.click())
  }

  async drawABoundary (pauseLength = 100) {
    const map = await this.map
    expect(map).toBeDisplayed()
    await map.waitForExist({ timeout: 5000 })
    await map.scrollIntoView()
    await map.click({ x: 10, y: 10 })
    await browser.pause(pauseLength)
    await map.click({ x: 20, y: 10 })
    await browser.pause(pauseLength)
    await map.click({ x: 20, y: 20 })
    await browser.pause(pauseLength)
    await map.click({ x: 10, y: 20 })
    await browser.pause(pauseLength)
    await map.click({ x: 10, y: 10 })
    await map.click({ x: 10, y: 10 })
    await browser.pause(pauseLength)
  }

  async getEmailEnvironmentAgencyText () {
    const emailEnvironmentAgencyParagraph = await this.getEmailEnvironmentAgencyParagraph
    return await (await emailEnvironmentAgencyParagraph.getText())
  }
}

module.exports = new FloodZoneResults()
