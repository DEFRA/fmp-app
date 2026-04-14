import { test } from '../fixtures.js'
import { pages } from '../pages/index.js'
import { locationData } from '../data/location-data.js'
import { userData } from '../data/user-data.js'

test.describe('End-to-end planning journey', () => {
  test('completes the journey from home to confirmation', { tag: '@both' }, async ({ steps, mapSteps }) => {
    await test.step('Home → Triage', async () => {
      await steps.open(pages.home.page)
      await steps.clickButton(pages.home.startButton)
    })

    await test.step('Triage → Location', async () => {
      await steps.chooseAndSubmit(pages.triage.planningOption)
    })

    await test.step('Location → Map', async () => {
      await steps.choose(pages.location.findByPostcode)
      await steps.type(pages.location.placeOrPostcodeInput, locationData.zone1Postcode)
      await steps.submit()
    })

    await test.step('Map → Results', async () => {
      await mapSteps.waitForMapToLoad()
      await mapSteps.zoomIn()
      await mapSteps.addSquare()
      await mapSteps.confirmBoundaryAndContinue()
    })

    await test.step('Results → Contact', async () => {
      await steps.clickLink(pages.results.orderFloodRiskDataButton)
    })

    await test.step('Contact → Check your details', async () => {
      await steps.type(pages.contact.fullNameInput, userData.name)
      await steps.type(pages.contact.emailInput, userData.email)
      await steps.submit()
    })

    await test.step('Check your details → Confirmation', async () => {
      await steps.clickButton(pages.checkYourDetails.orderButton)
      await steps.expectOn(pages.confirmation.page)
    })
  })
})
