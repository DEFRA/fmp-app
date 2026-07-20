import { test, expect } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Cookies page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.cookies.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.cookies.page)
  })

  test('navigates to the privacy notice page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.cookies.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })

  test('navigates to the terms and conditions page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.cookies.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })

  test('rejects the option to Do you want to accept analytics cookies?', async ({ steps, page }) => {
    await steps.choose(pages.cookies.rejectAnalyticsCookies)
    await steps.clickButton(pages.cookies.saveCookieSettingsButton)
    // Verify cookie value reflects rejection
    const cookies = await page.context().cookies()
    const policyCookie = cookies.find(c => c.name === 'fmp_cookie_policy')
    const decodedValue = Buffer.from(policyCookie?.value || '{}', 'base64').toString('utf-8')
    const policyValue = JSON.parse(decodedValue)
    expect(policyValue.analytics).toEqual(false)
    expect(policyValue.confirmed).toEqual(true)
  })

  test('accepts the option to Do you want to accept analytics cookies?', async ({ steps, page }) => {
    await steps.choose(pages.cookies.acceptAnalyticsCookies)
    await steps.clickButton(pages.cookies.saveCookieSettingsButton)
    // Verify cookie value reflects acceptance
    const cookies = await page.context().cookies()
    const policyCookie = cookies.find(c => c.name === 'fmp_cookie_policy')
    const decodedValue = Buffer.from(policyCookie?.value || '{}', 'base64').toString('utf-8')
    const policyValue = JSON.parse(decodedValue)
    expect(policyValue.analytics).toEqual(true)
    expect(policyValue.confirmed).toEqual(true)
  })
})
