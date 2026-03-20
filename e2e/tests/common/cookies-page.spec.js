import { test, expect } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('Cookies page', { tag: '@noDeps' }, () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.cookies.page)
  })
  test('displays the correct page title', { tag: '@validation' }, async () => {
    await steps.expectOn(pages.cookies.page)
  })
  test('navigates to the privacy notice page when clicking the link', { tag: '@routing' }, async () => {
    await steps.clickLink(pages.cookies.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })
  test('navigates to the terms and conditions page when clicking the link', { tag: '@routing' }, async () => {
    await steps.clickLink(pages.cookies.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })
  test('rejects the option to Do you want to accept analytics cookies?', { tag: '@routing' }, async ({ page }) => {
    await steps.choose(pages.cookies.rejectAnalyticsCookies)
    await steps.clickButton(pages.cookies.saveCookieSettingsButton)
    // Verify cookie value reflects rejection
    const cookies = await page.context().cookies()
    const gaCookieAfterReject = cookies.find(c => c.name === 'GA')
    expect(gaCookieAfterReject?.value).toEqual('Reject')
  })
  test('accepts the option to Do you want to accept analytics cookies?', { tag: '@routing' }, async ({ page }) => {
    await steps.choose(pages.cookies.acceptAnalyticsCookies)
    await steps.clickButton(pages.cookies.saveCookieSettingsButton)
    // Verify cookie value reflects acceptance
    const cookies = await page.context().cookies()
    const gaCookieAfterAccept = cookies.find(c => c.name === 'GA')
    expect(gaCookieAfterAccept?.value).toEqual('Accept')
  })
})
