import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('Map help page', { tag: '@noDeps' }, () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.mapHelp.page)
  })

  test('displays map help content', async () => {
    await steps.expectText('Help using the flood map')
  })

  test('confirms the accessibility link is present', async () => {
    await steps.expectLinkExists(pages.mapHelp.accessibilityLink)
  })

  test('confirms the get more information about a specific location link is present', async () => {
    await steps.expectLinkExists(pages.mapHelp.getMoreInformationLink)
  })

  test('confirms the draw a boundary link is present', async () => {
    await steps.expectLinkExists(pages.mapHelp.drawABoundaryLink)
  })

  test('confirms the how to use the data link is present', async () => {
    await steps.expectLinkExists(pages.mapHelp.howToUseDataLink)
  })

  test('confirms the other ways to get flood risk information link is present', async () => {
    await steps.expectLinkExists(pages.mapHelp.otherWaysToGetFloodRiskInformationLink)
  })

  test('navigates to the how to use flood map for planning data page when clicking the link', async () => {
    await steps.clickLink(pages.mapHelp.findOutMoreLink)
    await steps.expectOn(pages.howToUseFloodMapForPlanningData.page)
  })

  test('navigates to the accessibility statement page when clicking the link', async () => {
    await steps.clickLink(pages.mapHelp.ourAccessibilityStatementLink)
    await steps.expectOn(pages.accessibilityStatement.page)
  })
  // The following test validates that the external link can be reached.

  test('navigates to Find out about call charges page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.mapHelp.callChargesLink)
    await steps.expectUrlContains('call-charges')
  })
})
