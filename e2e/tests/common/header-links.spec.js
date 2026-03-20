import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('Header Links', { tag: '@noDeps' }, () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.home.page)
  })

  test('navigates to Flood map for planning and shows correct title', { tag: '@routing' }, async () => {
    await steps.clickLink(pages.header.floodMapForPlanningLink)
    await steps.expectOn(pages.home.page)
  })

  test('navigates to Feedback and shows correct title', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.header.giveYourFeedbackLink)
    await steps.expectUrlContains('/feedback')
  })
})
