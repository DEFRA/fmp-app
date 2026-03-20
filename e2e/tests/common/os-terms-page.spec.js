import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('OS Terms and conditions page', { tag: '@noDeps' }, () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.osTerms.page)
  })

  test('displays the correct page title', async () => {
    await steps.expectOn(pages.osTerms.page)
  })

  test('navigates to Ordnance Survey page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.osTerms.osLink)
    await steps.expectUrlContains('ordnancesurvey')
  })
})
