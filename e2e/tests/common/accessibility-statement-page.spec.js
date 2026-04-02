import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Accessibility statement', () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.accessibilityStatement.page)
  })

  test('displays the correct page title', { tag: ['@noDeps'] }, async ({ steps }) => {
    await steps.expectOn(pages.accessibilityStatement.page)
  })

  test('navigates to Ability Net page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.accessibilityStatement.abilityNetLink)
    await steps.expectUrlContains('abilitynet')
  })

  test('navigates to Equality Advisory page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.accessibilityStatement.equalityAdvisorySupportServiceLink)
    await steps.expectUrlContains('equalityadvisory')
  })

  test('navigates to Web Content Accessibility Guidelines page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.accessibilityStatement.webContentAccessibilityGuidelinesLink)
    await steps.expectUrlContains('w3.org/TR/WCAG22/')
  })

  test('navigates to full accessibility test report when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
    await steps.clickLink(pages.accessibilityStatement.fullAccessibilityTestReportLink)
    await steps.switchToNewWindow()
    await steps.expectUrlContains('accessibility-report')
  })

  test('it has link to enquiries@environment-agency.gov.uk', async ({ steps }) => {
    await steps.expectLinkExists(pages.accessibilityStatement.enquiriesEmailLink)
  })
})
