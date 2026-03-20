import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('Footer Links', { tag: '@noDeps' }, () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.home.page)
  })

  test('navigates to Accessibility statement and shows correct title', { tag: '@routing' }, async () => {
    await steps.clickLink(pages.footer.accessibilityStatementLink)
    await steps.expectOn(pages.accessibilityStatement.page)
  })

  test('navigates to Cookies and shows correct title', { tag: '@routing' }, async () => {
    await steps.clickLink(pages.footer.cookiesLink)
    await steps.expectOn(pages.cookies.page)
  })

  test('navigates to Privacy notice and shows correct title', { tag: '@routing' }, async () => {
    await steps.clickLink(pages.footer.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })

  test('navigates to Ordnance Survey terms and conditions and shows correct title', { tag: '@routing' }, async () => {
    await steps.clickLink(pages.footer.osTermsLink)
    await steps.expectOn(pages.osTerms.page)
  })
})
