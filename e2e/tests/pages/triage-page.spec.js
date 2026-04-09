import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Triage page', { tag: '@noDeps' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.triage.page)
  })

  test('navigates to location page after selecting planning option and submitting', async ({ steps }) => {
    await steps.choose(pages.triage.planningOption)
    await steps.submit()
    await steps.expectOn(pages.location.page)
  })

  test('shows validation error when submitting without selecting an option', async ({ steps }) => {
    await steps.submit()
    await steps.expectErrorText(pages.triage.missingSelectionError)
  })
})

test.describe('Triage page - external links', { tag: '@urlCheck' }, () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.triage.page)
  })

  test('redirects to GOV.UK long-term flood risk for buying/selling option', async ({ steps }) => {
    await steps.choose(pages.triage.buyingSellOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/check-long-term-flood-risk')
  })

  test('redirects to GOV.UK flooding history for flood history option', async ({ steps }) => {
    await steps.choose(pages.triage.floodHistoryOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/request-flooding-history')
  })

  test('redirects to GOV.UK long-term flood risk for insurance option', async ({ steps }) => {
    await steps.choose(pages.triage.insuranceOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/check-long-term-flood-risk')
  })

  test('redirects to GOV.UK flooding and extreme weather page for other option', async ({ steps }) => {
    await steps.choose(pages.triage.otherOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/browse/environment-countryside/flooding-extreme-weather')
  })
})
