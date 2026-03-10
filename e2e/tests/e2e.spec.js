import { Steps } from '../test-runner-api/steps.js'
import { pages } from '../pages/index.js'
import { locationData } from '../data/location-data.js'
import { MapSteps } from '../test-runner-api/map-steps.js'

describe('End-to-end planning journey', () => {
  const steps = new Steps()
  const mapSteps = new MapSteps()

  it('completes the journey from home to confirmation @both', async () => {
    // Home → Triage
    await steps.open(pages.home.page)
    await steps.clickButton(pages.home.startButton)

    // Triage → Location
    await steps.chooseAndSubmit(pages.triage.planningOption)

    // Location → Map
    await steps.choose(pages.location.findByPostcode)
    await steps.type(pages.location.placeOrPostcodeInput, locationData.zone1Postcode)
    await steps.submit()

    // Map → Results (draw boundary via UI)
    await mapSteps.waitForMapToLoad()
    await mapSteps.zoomIn()
    await mapSteps.addSquare()
    await mapSteps.confirmBoundaryAndContinue()

    // Results → Contact
    await steps.clickLink(pages.results.orderFloodRiskDataButton)

    // Contact → Check your details
    await steps.type(pages.contact.fullNameInput, 'INTERNAL_EA_TEST_Please ignore this RFI_Do not Process')
    await steps.type(pages.contact.emailInput, 'test@example.com')
    await steps.submit()

    // Check your details → Confirmation
    await steps.clickButton(pages.checkYourDetails.orderButton)
    await steps.expectOn(pages.confirmation.page)
  })
})
