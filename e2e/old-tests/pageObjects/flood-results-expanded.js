class FloodResultsExpanded {
  // Selectors
  get pageTitle () { return $('h1[class=\'govuk-heading-xl\']') }
  get pageContents () { return $('#main-content') }

  async getPageTitle () {
    const element = await this.pageTitle
    return await (await element.getText())
  }

  async checkYourResultsContent () {
    const element = await this.pageContents
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }
}

module.exports = new FloodResultsExpanded()
