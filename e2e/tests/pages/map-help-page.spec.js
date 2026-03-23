import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'

describe('Map help page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.mapHelp.page)
  })

  it('displays map help content @validation', async () => {
    await steps.expectText('Help using the flood map')
  })
  it('confirms the accessibility link is present@routing', async () => {
    await steps.expectLinkExists(pages.mapHelp.accessibilityLink)
  })
  it('confirms the get more information about a specific location link is present@routing', async () => {
    await steps.expectLinkExists(pages.mapHelp.getMoreInformationLink)
  })
  it('confirms the draw a boundary link is present@routing', async () => {
    await steps.expectLinkExists(pages.mapHelp.drawABoundaryLink)
  })
  it('confirms the how to use the data link is present@routing', async () => {
    await steps.expectLinkExists(pages.mapHelp.howToUseDataLink)
  })
  it('confirms the other ways to get flood risk information link is present@routing', async () => {
    await steps.expectLinkExists(pages.mapHelp.otherWaysToGetFloodRiskInformationLink)
  })

  it('navigates to the how to use flood map for planning data page when clicking the link @routing', async () => {
    await steps.clickLink(pages.mapHelp.findOutMoreLink)
    await steps.expectOn(pages.howToUseFloodMapForPlanningData.page)
  })
  it('navigates to the accessibility statement page when clicking the link @routing', async () => {
    await steps.clickLink(pages.mapHelp.ourAccessibilityStatementLink)
    await steps.expectOn(pages.accessibilityStatement.page)
  })
  // The following test validates that the external link can be reached.
  it('navigates to Find out about call charges page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.mapHelp.callChargesLink)
    await steps.expectUrlContains('call-charges')
  })
})
