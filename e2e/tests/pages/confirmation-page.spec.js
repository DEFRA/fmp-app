import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'
import { userData } from '../../data/user-data.js'

test.describe('Confirmation page', () => {
  let steps
  const email = userData.email
  const applicationReferenceNumber = 'ABCD1234EFGH5678'
  const encodedPolygon = encodeURIComponent(areaData.Yorkshire.polygon)

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    // Open confirmation directly to avoid dependency on external order submission.
    await steps.open({
      ...pages.confirmation.page,
      slug: `/confirmation?encodedPolygon=${encodedPolygon}&recipientemail=${encodeURIComponent(email)}&applicationReferenceNumber=${applicationReferenceNumber}&floodZone=3`
    })
    await steps.expectOn(pages.confirmation.page)
  })

  test('confirms the link to the results page is present', async () => {
    await steps.expectLinkExists(pages.confirmation.goBackToYourFloodInformationSummaryPageLink)
  })

  test('confirms the link to the area team email is present', async () => {
    await steps.expectLinkExists(pages.confirmation.contactEmailLink)
  })

  // The following tests validate that external links can be reached.

  test('navigates to to get more information to help you complete a flood risk assessmment page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.confirmation.toGetMoreInformationLink)
    await steps.expectUrlContains('get-information-about-flood-risk')
  })

  test('navigates to contact the Environment Agency page when clicking the link', { tag: '@urlCheck' }, async () => {
    await steps.clickLink(pages.confirmation.contactEnvironmentAgencyLink)
    await steps.expectUrlContains('contact-the-environment-agency')
  })
})
