import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Terms and Conditions page @noDeps', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.termsAndConditions.page)
  })
  it('displays the correct page title @validation', async () => {
    await steps.expectOn(pages.termsAndConditions.page)
  })
  it('navigates to the privacy notice page when clicking the link @routing', async () => {
    await steps.clickLink(pages.termsAndConditions.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })
  it('navigates to the cookies page when clicking the link @routing', async () => {
    await steps.clickLink(pages.termsAndConditions.cookiesLink)
    await steps.expectOn(pages.cookies.page)
  })
  it('navigates to the Ordnance Survey terms and conditions page when clicking the link @routing', async () => {
    await steps.clickLink(pages.termsAndConditions.osTermsLink)
    await steps.expectOn(pages.osTerms.page)
  })
  it('navigates to the privacy policy page when clicking the link @routing', async () => {
    await steps.clickLink(pages.termsAndConditions.privacyPolicyLink)
    await steps.expectOn(pages.privacyNotice.page)
  })
  it('navigates to the cookie policy page when clicking the link @routing', async () => {
    await steps.clickLink(pages.termsAndConditions.cookiePolicyLink)
    await steps.expectOn(pages.cookies.page)
  })
  it('navigates to the Contact us page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.termsAndConditions.contactUsLink)
    await steps.expectUrlContains('contact')
  })
  it('navigates to the Freedom of Information Act page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.termsAndConditions.freedomOfInformationActLink)
    await steps.expectUrlContains('freedom-of-information')
  })
  it('navigates to the Data Protection Act page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.termsAndConditions.dataProtectionActLink)
    await steps.expectUrlContains('data-protection')
  })
})
