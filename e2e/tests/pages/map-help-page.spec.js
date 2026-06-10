import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Map help page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.mapHelp.page)
  })

  test('displays map help content', async ({ steps }) => {
    await steps.expectText('Help using the flood map')
  })

  test('confirms the accessibility link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.mapHelp.accessibilityLink)
  })

  test('confirms the get more information about a specific location link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.mapHelp.getMoreInformationLink)
  })

  test('confirms the draw a boundary link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.mapHelp.drawABoundaryLink)
  })

  test('confirms the how to use the data link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.mapHelp.howToUseDataLink)
  })

  test('confirms the other ways to get flood risk information link is present', async ({ steps }) => {
    await steps.expectLinkExists(pages.mapHelp.otherWaysToGetFloodRiskInformationLink)
  })

  test('navigates to the how to use flood map for planning data page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.mapHelp.findOutMoreLink)
    await steps.expectOn(pages.howToUseFloodMapForPlanningData.page)
  })

  test('navigates to the accessibility statement page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.mapHelp.ourAccessibilityStatementLink)
    await steps.expectOn(pages.accessibilityStatement.page)
  })
})

test.describe('Map help page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.mapHelp.page)
  })
  test('navigates to Find out about call charges page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.mapHelp.callChargesLink)
    await steps.expectUrlContains('call-charges')
  })
})
