import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Terms and Conditions page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.termsAndConditions.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.termsAndConditions.page)
  })

  test('navigates to the privacy notice page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })

  test('navigates to the cookies page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.cookiesLink)
    await steps.expectOn(pages.cookies.page)
  })

  test('navigates to the Ordnance Survey terms and conditions page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.osTermsLink)
    await steps.expectOn(pages.osTerms.page)
  })

  test('navigates to the privacy policy page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.privacyPolicyLink)
    await steps.expectOn(pages.privacyNotice.page)
  })

  test('navigates to the cookie policy page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.cookiePolicyLink)
    await steps.expectOn(pages.cookies.page)
  })
})

test.describe('Terms and Conditions page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.termsAndConditions.page)
  })

  test('navigates to the Contact us page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.contactUsLink)
    await steps.expectUrlContains('contact')
  })

  test('navigates to the Freedom of Information Act page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.freedomOfInformationActLink)
    await steps.expectUrlContains('freedom-of-information')
  })

  test('navigates to the Data Protection Act page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.termsAndConditions.dataProtectionActLink)
    await steps.expectUrlContains('data-protection')
  })
})
