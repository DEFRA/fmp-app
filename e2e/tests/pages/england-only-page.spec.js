import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('England only page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.englandOnly.page)
  })

  it('displays the correct page title @validation', async () => {
    await steps.expectOn(pages.englandOnly.page)
  })

  // The following tests validate that external links can be reached.
  it('navigates to Scotland flood risk page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.scotlandFloodRiskLink)
    await steps.expectUrlContains('sepa.scot')
  })
  it('navigates to Wales flood risk page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.walesFloodRiskLink)
    await steps.expectUrlContains('naturalresources.wales')
  })

  it('navigates to Northern Ireland flood risk page when clicking the link @routing', async () => {
    await steps.clickLink(pages.home.northernIrelandFloodRiskLink)
    await steps.expectUrlContains('nidirect.gov.uk')
  })
})
