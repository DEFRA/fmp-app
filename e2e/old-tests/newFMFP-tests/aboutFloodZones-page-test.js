const aboutFloodZones = require('../pageObjects/NewFMFP/aboutFloodZones.js')

describe('Flood Zones and what they mean Page', function () {
  it('Verify all the components present in flood zones and what they mean page ', async () => {
    await browser.url(`${browser.options.baseUrl}/flood-zone-results-explained`)
    await aboutFloodZones.isFloodZonesAndWhatTheyMeanPageBodyTexts_Displayed()
  })

  // verify links in flood zones and what they mean page
  it('Verify link in flood zone 1 section ', async () => {
    await browser.url(`${browser.options.baseUrl}/flood-zone-results-explained`)
    await aboutFloodZones.clickFloodZone1_Link()
  })

  it('Verify link in flood defences section ', async () => {
    await browser.url(`${browser.options.baseUrl}/flood-zone-results-explained`)
    await aboutFloodZones.clickFloodDefences_Link()
  })
})
