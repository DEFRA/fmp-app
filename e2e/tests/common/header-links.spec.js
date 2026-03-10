import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Header Links', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.home.page)
  })

  it('navigates to Flood map for planning and shows correct title @routing', async () => {
    await steps.clickLink(pages.header.floodMapForPlanningLink)
    await steps.expectOn(pages.home.page)
  })

  it('navigates to Feedback and shows correct title @routing', async () => {
    await steps.clickLink(pages.header.giveYourFeedbackLink)
    await steps.expectUrlContains('/feedback')
  })
})
