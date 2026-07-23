import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { areaData, floodZonedata } from '../../data/location-data.js'

test.describe('Results page - Flood zone 1 content', () => {
  test('shows less than 1 hectare messaging and order flood risk data link when area is less than 1 hectare', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', floodZonedata.FZ1_With_SW_and_Area_LT_1Hectare))
    await steps.expectOnlyTexts([pages.results.fz1LessThan1HaText], pages.results.allFraTexts)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await steps.expectOnlyTexts(pages.results.riskProfiles.surfaceWater, pages.results.allRiskLines)
  })

  test('shows FRA required and more than 1 hectare messaging when area is greater than 1 hectare', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', floodZonedata.FZ1_With_SW_and_S))
    await steps.expectOnlyTexts([pages.results.fraRequiredText, pages.results.fz1MoreThan1HaText], pages.results.allFraTexts)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await steps.expectOnlyTexts(pages.results.riskProfiles.tidalAndSurfaceWater, pages.results.allRiskLines)
  })

  test('shows less than 1 hectare messaging when climate change data is unavailable', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', floodZonedata.FZ1_With_CC_Unavailable_and_SW))
    await steps.expectOnlyTexts([pages.results.fz1LessThan1HaText], pages.results.allFraTexts)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await steps.expectOnlyTexts(pages.results.riskProfiles.climateChangeAndSurfaceWater, pages.results.allRiskLines)
  })
})

test.describe('Results page - Surface water probability messaging', () => {
  test('shows 1 in 1000 probability messaging for present day and 2061 to 2125', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', floodZonedata.FZ1_SW_1in1000_PD_and_2061to2125))
    await steps.expectText(pages.results.sw1in1000PdAnd2061to2125Text)
    await steps.expectText(pages.results.sw1in1000PdText)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await steps.expectOnlyTexts(pages.results.riskProfiles.surfaceWater, pages.results.allRiskLines)
  })

  test('shows 1 in 100 probability messaging for present day and 2061 to 2125', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', floodZonedata.FZ1_SW_1in100_PD_and_2061to2125))
    await steps.expectText(pages.results.sw1in100PdAnd2061to2125Text)
    await steps.expectText(pages.results.sw1in100PdText)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await steps.expectOnlyTexts(pages.results.riskProfiles.surfaceWater, pages.results.allRiskLines)
  })

  test('shows 1 in 30 probability messaging for present day and 2061 to 2125', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', floodZonedata.FZ1_SW_1in30_PD_and_2061to2125))
    await steps.expectText(pages.results.sw1in30PdAnd2061to2125Text)
    await steps.expectText(pages.results.sw1in30PdText)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await steps.expectOnlyTexts(pages.results.riskProfiles.surfaceWater, pages.results.allRiskLines)
  })
})

test.describe('Results page - Flood zone 2 and 3 content', () => {
  test('shows FRA required messaging and order flood risk data link in Flood Zone 2 with fluvial, tidal and surface water', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('2', floodZonedata.FZ2_With_SW_and_S_and_R))
    await steps.expectText(pages.results.fraRequiredText)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await pages.results.expectRiskProfileTexts(steps.page, pages.results.riskProfiles.fluvialTidalAndSurfaceWater, pages.results.allRiskLines)
  })

  test('shows FRA required messaging and order flood risk data link in Flood Zone 3 with fluvial and surface water', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.FZ3_With_SW_and_R))
    await steps.expectText(pages.results.fraRequiredText)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await pages.results.expectRiskProfileTexts(steps.page, pages.results.riskProfiles.fluvialAndSurfaceWater, pages.results.allRiskLines)
  })

  test('shows FRA required messaging and order flood risk data link in Flood Zone 3 with fluvial only', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.FZ3_With_R))
    await steps.expectText(pages.results.fraRequiredText)
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    await pages.results.expectRiskProfileTexts(steps.page, pages.results.riskProfiles.fluvial, pages.results.allRiskLines)
  })
})

test.describe('Results page - Order flood risk data availability', () => {
  test('shows order flood risk data link when in an opted-in area under 300 hectares', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.polygon300))
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })

  test('does not show order flood risk data link when in an opted-in area over 300 hectares', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.polygon300_01))
    await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
  })

  test('shows Edit boundary link which navigates to map page when in an opted-in area over 300 hectares', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.polygon300_01))
    await steps.expectLinkExists(pages.results.editBoundaryLink)
    await steps.clickLink(pages.results.editBoundaryLink)
    await steps.expectOn(pages.map.page)
  })

  test('does not show order flood risk data link when in an opted-out area', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', areaData.HertfordshireAndNorthLondon.polygon))
    await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
  })

  test('does not show order flood risk data or edit boundary links when in an opted-out area over 300 hectares', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.polygonOver300InOptedOutArea))
    await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
    await steps.expectLinkNotExists(pages.results.editBoundaryLink)
  })

  test('shows order flood risk data link when in an opted-out area using internal URL', { tag: '@internal' }, async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', areaData.HertfordshireAndNorthLondon.polygon))
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })

  test('shows order flood risk data link when in an area on the England-Wales border', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.England_Wales_Border))
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })

  test('shows order flood risk data link when in an area on the England-Scotland border', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('1', floodZonedata.England_Scotland_Border))
    await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
  })

  test('does not show order flood risk data link and shows no jurisdiction messaging when area is not under an area teams jurisdiction', async ({ steps }) => {
    await steps.open(pages.results.pageForPolygon('3', floodZonedata.area_Team_NoJurisdiction))
    await steps.expectText(pages.results.noJurisdictionText)
    await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
  })
})
