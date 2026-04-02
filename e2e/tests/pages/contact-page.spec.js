import { test } from '@playwright/test'
import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'
import { invalidEmails } from '../../data/validation-data/invalid-contact-data.js'

test.describe('Contact page', () => {
  let steps

  test.beforeEach(async ({ page }) => {
    steps = new Steps(page)
    await steps.open({ ...pages.contact.page, slug: `/contact?encodedPolygon=${encodeURIComponent(areaData.Yorkshire.polygon)}` })
  })

  test('navigates to check your details page after entering valid contact details and submitting', async () => {
    await steps.type(pages.contact.fullNameInput, 'Test User')
    await steps.type(pages.contact.emailInput, 'test@example.com')
    await steps.submit()
    await steps.expectOn(pages.checkYourDetails.page)
  })

  test('shows validation error when submitting without entering details', async () => {
    await steps.submit()
    await steps.expectErrorText(pages.contact.missingNameError)
    await steps.expectErrorText(pages.contact.missingEmailError)
  })

  invalidEmails.forEach((invalidEmail) => {
    test(`shows validation error when entering invalid email '${invalidEmail}' @noDeps`, async () => {
      await steps.type(pages.contact.fullNameInput, 'Test User')
      await steps.type(pages.contact.emailInput, invalidEmail)
      await steps.submit()
      await steps.expectErrorText(pages.contact.missingEmailError)
    })
  })
})
