import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { floodZonedata } from '../../data/location-data.js'

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

test.describe('England only page - polygon routing', () => {
  for (const { label, polygon } of [
    { label: 'Wales', polygon: floodZonedata.Wales },
    { label: 'Scotland', polygon: floodZonedata.Scotland }
  ]) {
    test(`shows England only page for polygon: ${label}`, async ({ steps }) => {
      await steps.page.goto(pages.results.slug(polygon))
      await steps.expectOn(pages.englandOnly.page)
    })
  }
})
