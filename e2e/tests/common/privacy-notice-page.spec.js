import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Privacy notice page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.privacyNotice.page)
  })
  it('displays the correct page title @validation', async () => {
    await steps.expectOn(pages.privacyNotice.page)
  })
  it('navigates to the cookies page when clicking the link @routing', async () => {
    await steps.clickLink(pages.privacyNotice.cookiesLink)
    await steps.expectOn(pages.cookies.page)
  })
  it('navigates to the terms and conditions page when clicking the link @routing', async () => {
    await steps.clickLink(pages.privacyNotice.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })
  it('navigates to the cookies page when clicking the link @routing', async () => {
    await steps.clickLink(pages.privacyNotice.aboutCookiesLink)
    await steps.expectOn(pages.cookies.page)
  })
  it('navigates to the General Data Protection Regulation page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.gdprLink)
    await steps.expectUrlContains('eur/2016/679/')
  })
  it('navigates to the Data Protection Act page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.dataProtectionActLink)
    await steps.expectUrlContains('data-protection')
  })
  it('navigates to the personal information charter page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.personalInformationCharterLink)
    await steps.expectUrlContains('personal-information-charter')
  })
  it('navigates to the web browser page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.webBrowserLink)
    await steps.expectUrlContains('browser')
  })
  // it('navigates to the contacting us page when clicking the link @routing', async () => {
  //   await steps.clickLink(pages.privacyNotice.contactingUsLink)
  //   await steps.expectUrlContains('contact-us')
  // })
  it('navigates to the European Economic Area page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.europeanEconomicAreaLink)
    await steps.expectUrlContains('eu-eea')
  })
  it('navigates to the access your data page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.accessYourDataLink)
    await steps.expectUrlContains('data-protection')
  })
  it('navigates to the Information Commissioner’s Office page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.informationCommissionersOfficeLink)
    await steps.expectUrlContains('ico.org.uk')
  })
  it('navigates to the contact us page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.contactUsLink)
    await steps.expectUrlContains('contact-us')
  })
  it('navigates to the GOV.UK Verify page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.privacyNotice.govUkVerifyLink)
    await steps.expectUrlContains('govuk-verify')
  })
})
