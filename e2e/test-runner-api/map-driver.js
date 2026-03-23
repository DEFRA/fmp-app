import { FormDriver } from './form-driver.js'

const INITIAL_MAP_LOAD_PAUSE_MS = 5000
const BETWEEN_ZOOM_PAUSE_MS = 1500

export class MapDriver extends FormDriver {
  async mapLoaded () {
    await browser.pause(INITIAL_MAP_LOAD_PAUSE_MS) // Brief pause to allow map scripts to start loading
    const mapElement = await $('#map-viewport')
    await mapElement.waitForExist({ timeout: 20000 })
    await mapElement.waitForDisplayed({ timeout: 20000 })
  }

  async clickButton (buttonText) {
    // Find a button by visible text (either on the button or its label span)
    const text = (buttonText || '').trim()
    const button = await $(`//button[normalize-space()="${text}" or .//span[contains(@class,'fm-c-btn__label') and normalize-space()="${text}"]]`)
    await browser.waitUntil(async () => {
      try {
        const displayed = await button.isDisplayed()
        const aria = await button.getAttribute('aria-disabled')
        return displayed && aria !== 'true'
      } catch { return false }
    }, { timeout: 20000, interval: 250, timeoutMsg: `Button '${text}' did not become active` })
    await button.click()
  }

  async expandMenuSection (sectionTitle) {
    // Click the section header button by text
    const text = (sectionTitle || '').trim()
    const sectionTitleElement = await $(`//button[.//span[contains(@class,'fm-c-details__label-focus') and normalize-space()="${text}"]]`)
    await sectionTitleElement.waitForExist({ timeout: 20000 })
    await sectionTitleElement.waitForDisplayed({ timeout: 20000 })
    await sectionTitleElement.waitForClickable({ timeout: 20000 })
    await sectionTitleElement.click()
  }

  async selectMenuButtonOption (optionText) {
    // Menu button option: button containing a label span with the given text
    const optionElement = await $(`//button[.//span[contains(@class,'fm-c-btn__label') and normalize-space()="${optionText}"]]`)
    await optionElement.waitForDisplayed({ timeout: 20000 })
    await optionElement.waitForClickable({ timeout: 20000 })
    await optionElement.click()
  }

  async selectMenuRadioOption (optionText) {
    // Radio option: clickable label with the given text
    const optionElement = await $(`//label[contains(@class,'fm-c-segments__label') and normalize-space()="${optionText}"]`)
    await optionElement.waitForClickable({ timeout: 10000 })
    await optionElement.click()
  }

  async selectMenuCheckboxOption (optionText) {
    // Checkbox option: click the parent label that contains a span with the text
    const optionElement = await $(`//label[.//span[contains(@class,'fm-c-layers__text') and normalize-space()="${optionText}"]]`)
    await optionElement.waitForClickable({ timeout: 10000 })
    await optionElement.click()
  }

  async zoomIn (times = 3) {
    const zoomInButton = await $('button[aria-labelledby="map-zoom-in-label"][aria-controls="map-viewport"]')
    for (let i = 0; i < times; i++) {
      await zoomInButton.waitForClickable({ timeout: 10000 })
      await zoomInButton.click()
      await browser.pause(BETWEEN_ZOOM_PAUSE_MS) // Pause briefly between zooms to allow map to update
    }
  }
}
