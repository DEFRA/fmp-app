import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('OS Terms and conditions page @noDeps', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.osTerms.page)
  })

  it('displays the correct page title @validation', async () => {
    await steps.expectOn(pages.osTerms.page)
  })
  it('navigates to Ordnance Survey page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.osTerms.osLink)
    await steps.expectUrlContains('ordnancesurvey')
  })
})
