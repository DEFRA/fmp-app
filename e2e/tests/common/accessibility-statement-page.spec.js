import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('Accessibility statement', () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.accessibilityStatement.page)
  })

  test('displays the correct page title', { tag: ['@noDeps'] }, async () => {
    await steps.expectOn(pages.accessibilityStatement.page)
  })

  test('navigates to Ability Net page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.accessibilityStatement.abilityNetLink)
    await steps.expectUrlContains('abilitynet')
  })

  test('navigates to Equality Advisory page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.accessibilityStatement.equalityAdvisorySupportServiceLink)
    await steps.expectUrlContains('equalityadvisory')
  })

  test('navigates to Web Content Accessibility Guidelines page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.accessibilityStatement.webContentAccessibilityGuidelinesLink)
    await steps.expectUrlContains('w3.org/TR/WCAG22/')
  })

  test('navigates to full accessibility test report when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.accessibilityStatement.fullAccessibilityTestReportLink)
    await steps.switchToNewWindow()
    await steps.expectUrlContains('accessibility-report')
  })

  test('it has link to enquiries@environment-agency.gov.uk', async () => {
    await steps.expectLinkExists(pages.accessibilityStatement.enquiriesEmailLink)
  })
})
