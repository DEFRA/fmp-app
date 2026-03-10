import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Triage page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.triage.page)
  })

  it('navigates to location page after selecting planning option and submitting @routing', async () => {
    await steps.choose(pages.triage.planningOption)
    await steps.submit()
    await steps.expectOn(pages.location.page)
  })

  it('shows validation error when submitting without selecting an option @validation', async () => {
    await steps.submit()
    await steps.expectErrorText(pages.triage.missingSelectionError)
  })

  // Assert on URL rather than page title as we're navigating to external GOV.UK pages that we don't own and can't control the content of
  it('redirects to GOV.UK long-term flood risk for buying/selling option @routing', async () => {
    await steps.choose(pages.triage.buyingSellOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/check-long-term-flood-risk')
  })

  it('redirects to GOV.UK flooding history for flood history option @routing', async () => {
    await steps.choose(pages.triage.floodHistoryOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/request-flooding-history')
  })

  it('redirects to GOV.UK long-term flood risk for insurance option @routing', async () => {
    await steps.choose(pages.triage.insuranceOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/check-long-term-flood-risk')
  })

  it('redirects to GOV.UK flooding and extreme weather page for other option @routing', async () => {
    await steps.choose(pages.triage.otherOption)
    await steps.submit()
    await steps.expectUrlContains('gov.uk/browse/environment-countryside/flooding-extreme-weather')
  })
})
