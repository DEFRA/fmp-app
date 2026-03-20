import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'

test.describe('Results page', () => {
  let steps
  const slug = (polygon) => `/results?encodedPolygon=${encodeURIComponent(polygon)}`

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
  })

  Object.values(areaData).forEach(({ polygon, floodZone }, index) => {

    test(`displays correct flood zone information for area ${index + 1}`, async () => {
      await steps.open({
        ...pages.results.pageWithZone(floodZone),
        slug: slug(polygon)
      })
      await steps.expectOn(pages.results.pageWithZone(floodZone))
    })
  })

  test('has link to order flood risk data when in an opted-in area', async () => {
    const polygon = areaData.Yorkshire.polygon
    await steps.open({
      ...pages.results.pageWithZone(areaData.Yorkshire.floodZone),
      slug: slug(polygon)
    })
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })

  test('does not show order flood risk data link when in an opted-out area', async () => {
    const polygon = areaData.HertfordshireAndNorthLondon.polygon
    await steps.open({
      ...pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone),
      slug: slug(polygon)
    })
    await steps.expectOn(pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone))
    await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
  })

  test('has link to order flood risk data link when in an opted-out area', { tag: '@internal' }, async () => {
    const polygon = areaData.HertfordshireAndNorthLondon.polygon
    await steps.open({
      ...pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone),
      slug: slug(polygon)
    })
    await steps.expectOn(pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone))
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })
})
