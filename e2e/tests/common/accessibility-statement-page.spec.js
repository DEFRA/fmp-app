import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Accessibility statement', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.accessibilityStatement.page)
  })

  it('displays the correct page title @validation @noDeps', async () => {
    await steps.expectOn(pages.accessibilityStatement.page)
  })
  it('navigates to Ability Net page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.accessibilityStatement.abilityNetLink)
    await steps.expectUrlContains('abilitynet')
  })
  it('navigates to Equality Advisory page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.accessibilityStatement.equalityAdvisorySupportServiceLink)
    await steps.expectUrlContains('equalityadvisory')
  })
  it('navigates to Web Content Accessibility Guidelines page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.accessibilityStatement.webContentAccessibilityGuidelinesLink)
    await steps.expectUrlContains('w3.org/TR/WCAG22/')
  })
  it('navigates to full accessibility test report when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.accessibilityStatement.fullAccessibilityTestReportLink)
    await steps.switchToNewWindow()
    await steps.expectUrlContains('accessibility-report')
  })
  it('it has link to enquiries@environment-agency.gov.uk @validation', async () => {
    await steps.expectLinkExists(pages.accessibilityStatement.enquiriesEmailLink)
  })
})
