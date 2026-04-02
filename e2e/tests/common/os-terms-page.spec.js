import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('OS Terms and conditions page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.osTerms.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.osTerms.page)
  })

  test('navigates to Ordnance Survey page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.osTerms.osLink)
    await steps.expectUrlContains('ordnancesurvey')
  })
})
