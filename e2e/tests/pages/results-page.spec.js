import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'

describe('Results page', () => {
  let steps
  const slug = (polygon) => `/results?encodedPolygon=${encodeURIComponent(polygon)}`

  beforeEach(async () => {
    steps = new Steps()
  })

  Object.values(areaData).forEach(({ polygon, floodZone }, index) => {
    it(`displays correct flood zone information for area ${index + 1} @validation`, async () => {
      await steps.open({
        ...pages.results.pageWithZone(floodZone),
        slug: slug(polygon)
      })
      await steps.expectOn(pages.results.pageWithZone(floodZone))
    })
  })

  it('has link to order flood risk data when in an opted-in area @validation', async () => {
    const polygon = areaData.Yorkshire.polygon
    await steps.open({
      ...pages.results.pageWithZone(areaData.Yorkshire.floodZone),
      slug: slug(polygon)
    })
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })

  it('does not show order flood risk data link when in an opted-out area @validation', async () => {
    const polygon = areaData.HertfordshireAndNorthLondon.polygon
    await steps.open({
      ...pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone),
      slug: slug(polygon)
    })
    await steps.expectOn(pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone))
    await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
  })

  it('has link to order flood risk data link when in an opted-out area @internal', async () => {
    const polygon = areaData.HertfordshireAndNorthLondon.polygon
    await steps.open({
      ...pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone),
      slug: slug(polygon)
    })
    await steps.expectOn(pages.results.pageWithZone(areaData.HertfordshireAndNorthLondon.floodZone))
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })
})
