import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Header Links', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.location.page)
  })

  test('navigates to Flood map for planning page', { tag: '@urlCheck' }, async ({ steps }) => {
    test.skip(!['prod', 'prd-green', 'prd-blue'].includes(process.env.TEST_ENV), 'Link only resolves in prod')
    await steps.clickLink(pages.header.floodMapForPlanningLink)
    await steps.expectUrlContains('/get-flood-risk-information-for-planning-application')
  })
})

test.describe('Header Links - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.location.page)
  })

  test('navigates to Feedback and shows correct title', async ({ steps }) => {
    await steps.clickLink(pages.header.giveYourFeedbackLink)
    await steps.expectUrlContains('/feedback')
  })
})
