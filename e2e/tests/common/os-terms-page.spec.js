import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('OS Terms and conditions page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.osTerms.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.osTerms.page)
  })
})

test.describe('OS Terms and conditions page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.osTerms.page)
  })

  test('navigates to Ordnance Survey page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.osTerms.osLink)
    await steps.expectUrlContains('ordnancesurvey')
  })
})
