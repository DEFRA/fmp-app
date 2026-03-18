import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Footer Links @noDeps', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.home.page)
  })

  it('navigates to Accessibility statement and shows correct title @routing', async () => {
    await steps.clickLink(pages.footer.accessibilityStatementLink)
    await steps.expectOn(pages.accessibilityStatement.page)
  })

  it('navigates to Cookies and shows correct title @routing', async () => {
    await steps.clickLink(pages.footer.cookiesLink)
    await steps.expectOn(pages.cookies.page)
  })

  it('navigates to Privacy notice and shows correct title @routing', async () => {
    await steps.clickLink(pages.footer.privacyNoticeLink)
    await steps.expectOn(pages.privacyNotice.page)
  })

  it('navigates to Ordnance Survey terms and conditions and shows correct title @routing', async () => {
    await steps.clickLink(pages.footer.osTermsLink)
    await steps.expectOn(pages.osTerms.page)
  })
})
