import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { areaData } from '../../data/location-data.js'
import { invalidEmails } from '../../data/validation-data/invalid-contact-data.js'

describe('Contact page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open({ ...pages.contact.page, slug: `/contact?encodedPolygon=${encodeURIComponent(areaData.Yorkshire.polygon)}` })
  })

  it('navigates to check your details page after entering valid contact details and submitting @routing', async () => {
    await steps.type(pages.contact.fullNameInput, 'Test User')
    await steps.type(pages.contact.emailInput, 'test@example.com')
    await steps.submit()
    await steps.expectOn(pages.checkYourDetails.page)
  })

  it('shows validation error when submitting without entering details @validation', async () => {
    await steps.submit()
    await steps.expectErrorText(pages.contact.missingNameError)
    await steps.expectErrorText(pages.contact.missingEmailError)
  })

  invalidEmails.forEach((invalidEmail) => {
    it(`shows validation error when entering invalid email '${invalidEmail}' @validation`, async () => {
      await steps.type(pages.contact.fullNameInput, 'Test User')
      await steps.type(pages.contact.emailInput, invalidEmail)
      await steps.submit()
      await steps.expectErrorText(pages.contact.missingEmailError)
    })
  })
})
