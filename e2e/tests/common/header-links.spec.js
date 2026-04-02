import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Header Links', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.home.page)
  })

  test('navigates to Flood map for planning and shows correct title', async ({ steps }) => {
    await steps.clickLink(pages.header.floodMapForPlanningLink)
    await steps.expectOn(pages.home.page)
  })

  test('navigates to Feedback and shows correct title', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.header.giveYourFeedbackLink)
    await steps.expectUrlContains('/feedback')
  })
})
