import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Privacy notice page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.privacyNotice.page)
  })

  test('displays the correct page title', async ({ steps }) => {
    await steps.expectOn(pages.privacyNotice.page)
  })

  test('navigates to the cookies page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.cookiesLink)
    await steps.expectOn(pages.cookies.page)
  })

  test('navigates to the terms and conditions page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })

  test('navigates to the cookies page via about cookies link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.aboutCookiesLink)
    await steps.expectOn(pages.cookies.page)
  })
})

test.describe('Privacy notice page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.privacyNotice.page)
  })

  test('navigates to the General Data Protection Regulation page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.gdprLink)
    await steps.expectUrlContains('eur/2016/679/')
  })

  test('navigates to the Data Protection Act page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.dataProtectionActLink)
    await steps.expectUrlContains('data-protection')
  })

  test('navigates to the personal information charter page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.personalInformationCharterLink)
    await steps.expectUrlContains('personal-information-charter')
  })

  test('navigates to the web browser page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.webBrowserLink)
    await steps.expectUrlContains('browser')
  })

  test('navigates to the contacting us page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.contactingUsLink)
    await steps.expectUrlContains('contact-us')
  })

  test('navigates to the European Economic Area page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.europeanEconomicAreaLink)
    await steps.expectUrlContains('eu-eea')
  })

  test('navigates to the access your data page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.accessYourDataLink)
    await steps.expectUrlContains('data-protection')
  })

  test('navigates to the Information Commissioner\u2019s Office page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.informationCommissionersOfficeLink)
    await steps.expectUrlContains('ico.org.uk')
  })

  test('navigates to the contact us page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.contactUsLink)
    await steps.expectUrlContains('contact-us')
  })

  test('navigates to the GOV.UK Verify page when clicking the link', async ({ steps }) => {
    await steps.clickLink(pages.privacyNotice.govUkVerifyLink)
    await steps.expectUrlContains('govuk-verify')
  })
})
