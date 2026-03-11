import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'

describe('Confirmation page', () => {
  let steps
  const fullName = encodeURIComponent('INTERNAL_EA_TEST_Please ignore this RFI_Do not Process')
  const email = encodeURIComponent('test@example.com')
  const encodedPolygon = encodeURIComponent(areaData.Yorkshire.polygon)

  beforeEach(async () => {
    steps = new Steps()
    // Complete the journey to reach confirmation page legitimately
    await steps.open({
      ...pages.checkYourDetails.page,
      slug: `/check-your-details?encodedPolygon=${encodedPolygon}&fullName=${fullName}&recipientemail=${email}`
    })
    await steps.clickButton(pages.checkYourDetails.orderButton)
  })

  it('confirms the link to the results page is present @routing', async () => {
    await steps.expectLinkExists(pages.confirmation.goBackToYourFloodInformationSummaryPageLink)
  })
  it('confirms the link to the area team email is present @routing', async () => {
    await steps.expectLinkExists(pages.confirmation.contactEnvironmentAgencyLink, '@environment-agency.gov.uk')
  })

  // The following tests validate that external links can be reached.
  it('navigates to to get more information to help you complete a flood risk assessmment page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.confirmation.toGetMoreInformationLink)
    await steps.expectUrlContains('get-information-about-flood-risk')
  })
  it('navigates to contact the Environment Agency page when clicking the link @urlCheck', async () => {
    await steps.clickLink(pages.confirmation.contactEnvironmentAgencyLink)
    await steps.expectUrlContains('contact-the-environment-agency')
  })
})
