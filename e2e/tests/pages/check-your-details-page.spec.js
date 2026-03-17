import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'
import { userData } from '../../data/user-data.js'

describe('Check your details page', () => {
  let steps
  const fullName = encodeURIComponent(userData.name)
  const email = encodeURIComponent(userData.email)
  const encodedPolygon = encodeURIComponent(areaData.Yorkshire.polygon)

  beforeEach(async () => {
    steps = new Steps()
    await steps.open({
      ...pages.checkYourDetails.page,
      slug: `/check-your-details?encodedPolygon=${encodedPolygon}&fullName=${fullName}&recipientemail=${email}`
    })
  })

  it('confirms the change name link is present @routing', async () => {
    await steps.expectLinkExists(pages.checkYourDetails.changeNameLink)
  })
  it('confirms the change email link is present @routing', async () => {
    await steps.expectLinkExists(pages.checkYourDetails.changeEmailLink)
  })
  it('confirms the change location link is present @routing', async () => {
    await steps.expectLinkExists(pages.checkYourDetails.changeLocationLink)
  })

  it('navigates to confirmation page after clicking order button @routing', async () => {
    await steps.clickButton(pages.checkYourDetails.orderButton)
    await steps.expectOn(pages.confirmation.page)
  })
})
