import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Footer Links', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.home.page)
  })

  test('navigates to Accessibility statement and shows correct title', async ({ steps }) => {
    await steps.clickLink(pages.footer.accessibilityStatementLink)
    await steps.expectOn(pages.accessibilityStatement.page)
  })

  test('navigates to Cookies and shows correct title', async ({ steps }) => {
    await steps.clickLink(pages.footer.cookiesLink)
    await steps.expectOn(pages.cookies.page)
  })

  test('navigates to Privacy notice and shows correct title', async ({ steps }) => {
    await steps.clickLink(pages.footer.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })

  test('navigates to Ordnance Survey terms and conditions and shows correct title', async ({ steps }) => {
    await steps.clickLink(pages.footer.osTermsLink)
    await steps.expectOn(pages.osTerms.page)
  })
})
