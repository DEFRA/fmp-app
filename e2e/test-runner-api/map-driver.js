import { expect } from '@playwright/test'
import { FormDriver } from './form-driver.js'

const INITIAL_MAP_LOAD_PAUSE_MS = 5000
const BETWEEN_ZOOM_PAUSE_MS = 1500

export class MapDriver extends FormDriver {
  async mapLoaded () {
    await this.page.waitForTimeout(INITIAL_MAP_LOAD_PAUSE_MS)
    const mapElement = this.page.locator('#map-viewport')
    await expect(mapElement).toBeVisible()
  }

  async clickButton (buttonText) {
    const text = (buttonText || '').trim()
    const button = this.page.getByRole('button', { name: text, exact: true }).first()
    await expect(async () => {
      expect(await button.isVisible()).toBe(true)
      expect(await button.getAttribute('aria-disabled')).not.toBe('true')
    }).toPass()
    await button.click()
  }

  async expandMenuSection (sectionTitle) {
    const text = (sectionTitle || '').trim()
    const sectionTitleElement = this.page.getByRole('button', { name: text, exact: true }).first()
    await sectionTitleElement.click()
  }

  async selectMenuButtonOption (optionText) {
    const optionElement = this.page.getByRole('button', { name: optionText, exact: true }).first()
    await optionElement.click()
  }

  async selectMenuRadioOption (optionText) {
    await this.page.getByRole('radio', { name: optionText, exact: true }).check()
  }

  async selectMenuCheckboxOption (optionText) {
    await this.page.getByRole('checkbox', { name: optionText, exact: true }).check()
  }

  async zoomIn (times = 3) {
    const zoomInButton = this.page.getByRole('button', { name: 'Zoom in', exact: true }).first()
    for (let i = 0; i < times; i++) {
      await zoomInButton.click()
      await this.page.waitForTimeout(BETWEEN_ZOOM_PAUSE_MS)
    }
  }
}
