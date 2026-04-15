import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('England only page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.englandOnly.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.englandOnly.page)
  })
})

test.describe('England only page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.englandOnly.page)
  })

  test('navigates to Scotland flood risk page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.scotlandFloodRiskLink)
    await steps.expectUrlContains('sepa.scot')
  })

  test('navigates to Wales flood risk page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.walesFloodRiskLink)
    await steps.expectUrlContains('naturalresources.wales')
  })

  test('navigates to Northern Ireland flood risk page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.home.northernIrelandFloodRiskLink)
    await steps.expectUrlContains('nidirect.gov.uk')
  })
})
