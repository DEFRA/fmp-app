import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('England only page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.englandOnly.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.englandOnly.page)
  })

  // The following tests validate that external links can be reached.

  test('navigates to Scotland flood risk page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.home.scotlandFloodRiskLink)
    await steps.expectUrlContains('sepa.scot')
  })

  test('navigates to Wales flood risk page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.home.walesFloodRiskLink)
    await steps.expectUrlContains('naturalresources.wales')
  })

  test('navigates to Northern Ireland flood risk page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.home.northernIrelandFloodRiskLink)
    await steps.expectUrlContains('nidirect.gov.uk')
  })
})
