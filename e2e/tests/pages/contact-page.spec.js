import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'
import { userData } from '../../data/user-data.js'
import { invalidEmails } from '../../data/validation-data/invalid-contact-data.js'

test.describe('Contact page', () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open({ ...pages.contact.page, slug: `/contact?encodedPolygon=${encodeURIComponent(areaData.Yorkshire.polygon)}` })
  })

  test('navigates to check your details page after entering valid contact details and submitting', async ({ steps }) => {
    await steps.type(pages.contact.fullNameInput, userData.name)
    await steps.type(pages.contact.emailInput, userData.email)
    await steps.submit()
    await steps.expectOn(pages.checkYourDetails.page)
  })

  test('shows validation error when submitting without entering details', async ({ steps }) => {
    await steps.submit()
    await steps.expectErrorText(pages.contact.missingNameError)
    await steps.expectErrorText(pages.contact.missingEmailError)
  })

  for (const invalidEmail of invalidEmails) {
    test(`shows validation error when entering invalid email '${invalidEmail}'`, { tag: '@noDeps' }, async ({ steps }) => {
      await steps.type(pages.contact.fullNameInput, userData.name)
      await steps.type(pages.contact.emailInput, invalidEmail)
      await steps.submit()
      await steps.expectErrorText(pages.contact.missingEmailError)
    })
  }
})
