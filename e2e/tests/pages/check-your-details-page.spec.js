import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'
import { userData } from '../../data/user-data.js'

test.describe('Check your details page', () => {
  let steps
  const fullName = encodeURIComponent(userData.name)
  const email = encodeURIComponent(userData.email)
  const encodedPolygon = encodeURIComponent(areaData.Yorkshire.polygon)

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open({
      ...pages.checkYourDetails.page,
      slug: `/check-your-details?encodedPolygon=${encodedPolygon}&fullName=${fullName}&recipientemail=${email}`
    })
  })

  test('confirms the change name link is present', { tag: '@routing' }, async () => {
    await steps.expectLinkExists(pages.checkYourDetails.changeNameLink)
  })
  test('confirms the change email link is present', { tag: '@routing' }, async () => {
    await steps.expectLinkExists(pages.checkYourDetails.changeEmailLink)
  })
  test('confirms the change location link is present', { tag: '@routing' }, async () => {
    await steps.expectLinkExists(pages.checkYourDetails.changeLocationLink)
  })

  test('navigates to confirmation page after clicking order button', { tag: '@routing' }, async () => {
    await steps.clickButton(pages.checkYourDetails.orderButton)
    await steps.expectOn(pages.confirmation.page)
  })
})
