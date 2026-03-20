import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

test.describe('Triage page', { tag: '@noDeps' }, () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open(pages.triage.page)
  })

  test('navigates to location page after selecting planning option and submitting', { tag: '@routing' }, async () => {
    await steps.choose(pages.triage.planningOption)
    await steps.submit()
    await steps.expectOn(pages.location.page)
  })

  test('shows validation error when submitting without selecting an option', { tag: '@validation' }, async () => {
    await steps.submit()
    await steps.expectErrorText(pages.triage.missingSelectionError)
  })

  // Assert on URL rather than page title as we're navigating to external GOV.UK pages that we don't own and can't control the content of
  test('redirects to GOV.UK long-term flood risk for buying/selling option', { tag: '@urlCheck' }, async () => {
    await steps.choose(pages.triage.buyingSellOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/check-long-term-flood-risk')
  })

  test('redirects to GOV.UK flooding history for flood history option', { tag: '@urlCheck' }, async () => {
    await steps.choose(pages.triage.floodHistoryOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/request-flooding-history')
  })

  test('redirects to GOV.UK long-term flood risk for insurance option', { tag: '@urlCheck' }, async () => {
    await steps.choose(pages.triage.insuranceOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/check-long-term-flood-risk')
  })

  test('redirects to GOV.UK flooding and extreme weather page for other option', { tag: '@urlCheck' }, async () => {
    await steps.choose(pages.triage.otherOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/browse/environment-countryside/flooding-extreme-weather')
  })
})
