import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Cookies page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.cookies.page)
  })
  it('displays the correct page title @validation', async () => {
    await steps.expectOn(pages.cookies.page)
  })
  it('navigates to the privacy notice page when clicking the link @routing', async () => {
    await steps.clickLink(pages.cookies.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })
  it('navigates to the terms and conditions page when clicking the link @routing', async () => {
    await steps.clickLink(pages.cookies.termsAndConditionsLink)
    await steps.expectOn(pages.termsAndConditions.page)
  })
  it('rejects the option to Do you want to accept analytics cookies? @routing', async () => {
    await steps.choose(pages.cookies.rejectAnalyticsCookies)
    await steps.clickButton(pages.cookies.saveCookieSettingsButton)
    // Verify cookie value reflects rejection
    const [gaCookieAfterReject] = await browser.getCookies(['GA'])
    expect(gaCookieAfterReject?.value).toEqual('Reject')
  })
  it('accepts the option to Do you want to accept analytics cookies? @routing', async () => {
    await steps.choose(pages.cookies.acceptAnalyticsCookies)
    await steps.clickButton(pages.cookies.saveCookieSettingsButton)
    // Verify cookie value reflects acceptance
    const [gaCookieAfterAccept] = await browser.getCookies(['GA'])
    expect(gaCookieAfterAccept?.value).toEqual('Accept')
  })
})
