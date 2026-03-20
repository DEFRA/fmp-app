import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData, floodZonedata } from '../../data/location-data.js'

test.describe('Next steps page', () => {
  let steps
  const slug = (polygon) => `/next-steps?encodedPolygon=${encodeURIComponent(polygon)}`

  test.describe('Link and content tests', () => {
    const polygon = areaData.Yorkshire.polygon

    test.beforeEach(async ({ page }) => {
      steps = new Steps(page)
      await steps.open({ ...pages.nextSteps.page, slug: slug(polygon) })
    })

    test('displays next steps information', { tag: '@validation' }, async () => {
      await steps.expectText('Next steps for your planning application')
    })

    test('navigates to the Flood zones and what they mean page when clicking the link', { tag: '@routing' }, async () => {
      await steps.clickLink(pages.nextSteps.floodZonesAndWhatTheyMeanLink)
      await steps.expectOn(pages.floodZoneResultsExplained.page)
    })

    // The following tests validate that external links can be reached.
    test('navigates to Flood risk assessments: climate change allowances page when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.takeIntoAccountClimateChangeAllowancesLink)
      await steps.expectUrlContains('climate-change-allowances')
    })

    test('navigates to Flood risk assessments: applying for planning permission page when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.howToDoAnAssessmentLink)
      await steps.expectUrlContains('for-planning-applications')
    })

    test('navigates to Reservoirs map page when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.reservoirFloodRiskLink)
      await steps.expectUrlContains('Reservoirs')
    })

    test('navigates to Groundwater flooding page when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.britishGeologicalSurveyGroundwaterFloodingLink)
      await steps.expectUrlContains('groundwater-flooding')
    })

    test('navigates to Groundwater: current status and flood risk page when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.groundwaterCurrentStatusAndFloodRiskLink)
      await steps.expectUrlContains('groundwater-current-status-and-flood-risk')
    })

    test('navigates to Mining and groundwater constraints for development page when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.miningAndGroundwaterConstraintsForDevelopmentLink)
      await steps.expectUrlContains('mining-and-groundwater-constraints-for-development')
    })

    test('navigates to Addressing residual flood riskpage when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.residualRiskLink)
      await steps.expectUrlContains('flood-risk-and-coastal-change#para41')
    })

    test('navigates to Get information about flood risk from rivers and the sea to help you to complete a FRA page when clicking the link', { tag: '@urlCheck' }, async () => {
      await steps.clickLink(pages.nextSteps.findOutWhatProductsAreAvailableLink)
      await steps.expectUrlContains('get-information-about-flood-risk-from-rivers-and-the-sea-to-help-you-to-complete-afra')
    })
  })

  test.describe('Conditional content checks', () => {
    test.beforeEach(async ({ page }) => {
      steps = new Steps(page)
    })

    // The following tests validate the presence of the order flood risk data link based size of polygon and whether the area is opted-in or opted-out.
    test('has link to order flood risk data when in an opted-in area under 300 hectares', { tag: '@validation' }, async () => {
      const polygon = floodZonedata.polygon300
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectLinkExists(pages.nextSteps.orderFloodRiskDataButton)
    })

    test('does not show order flood risk data link when in an opted-in area over 300 hectares', { tag: '@validation' }, async () => {
      const polygon = floodZonedata.polygon300_01
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectLinkNotExists(pages.nextSteps.orderFloodRiskDataButton)
    })

    test('shows an Edit boundary button which can be clicked to navigate back to the map page when in an opted-in area over 300 hectares', { tag: '@validation' }, async () => {
      const polygon = floodZonedata.polygon300_01
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectButtonExists(pages.nextSteps.editBoundaryButton)
      await steps.clickButton(pages.nextSteps.editBoundaryButton)
      await steps.expectOn(pages.map.page)
    })

    test('does not show order flood risk data link when in an opted-out area', { tag: '@validation' }, async () => {
      const { polygon } = areaData.HertfordshireAndNorthLondon
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectOn(pages.nextSteps.page)
      await steps.expectLinkNotExists(pages.nextSteps.orderFloodRiskDataButton)
    })

    test('has link to order flood risk data button when in an opted-out area when using internal URL', { tag: '@internal' }, async () => {
      const { polygon } = areaData.HertfordshireAndNorthLondon
      await steps.open({
        ...pages.nextSteps.page,
        slug: `/next-steps?encodedPolygon=${encodeURIComponent(polygon)}`
      })
      await steps.expectOn(pages.nextSteps.page)
      await steps.expectLinkExists(pages.nextSteps.orderFloodRiskDataButton)
    })
  })
})
