import { expect } from '@playwright/test'
import { FormDriver } from './form-driver.js'
import * as mapPage from '../pages/map.page.js'

const INITIAL_MAP_LOAD_PAUSE_MS = 5000
const BETWEEN_ZOOM_PAUSE_MS = 1500
const ARIA_DISABLED = 'aria-disabled'

export class MapDriver extends FormDriver {
  async waitForMapToLoad () {
    await this.page.waitForTimeout(INITIAL_MAP_LOAD_PAUSE_MS)
    await expect(this.page.locator('#map-viewport')).toBeVisible()
  }

  async clickButton (element) {
    const text = element.text.trim()
    const button = this.page.getByRole('button', { name: text, exact: true }).first()
    await expect(async () => {
      expect(await button.isVisible()).toBe(true)
      expect(await button.getAttribute(ARIA_DISABLED)).not.toBe('true')
    }).toPass()
    await button.click()
  }

  async expandMenuSection (element) {
    const text = element.text.trim()
    await this.page.getByRole('button', { name: text }).first().click()
  }

  async chooseMenuOption (element) {
    if (element.type === 'menuButtonOption') {
      await this.page.getByRole('button', { name: element.text, exact: true }).first().click()
      return
    }
    if (element.type === 'menuRadioOption') {
      await this.page.getByRole('radio', { name: element.text, exact: true }).check()
      return
    }
    if (element.type === 'menuCheckboxOption') {
      await this.page.getByRole('checkbox', { name: element.text, exact: true }).check()
      return
    }
    throw new Error(`chooseMenuOption(): unsupported element type '${element.type}'`)
  }

  async zoomIn (times = 3) {
    for (let i = 0; i < times; i++) {
      const zoomInButton = this.page.getByRole('button', { name: 'Zoom in', exact: true }).first()
      await expect(async () => {
        expect(await zoomInButton.isVisible()).toBe(true)
        expect(await zoomInButton.getAttribute(ARIA_DISABLED)).not.toBe('true')
      }).toPass()
      await zoomInButton.click()
      await this.page.waitForLoadState('networkidle')
      await this.page.waitForTimeout(BETWEEN_ZOOM_PAUSE_MS)
      await expect(async () => {
        expect(await zoomInButton.getAttribute(ARIA_DISABLED)).not.toBe('true')
      }).toPass()
    }
  }

  async addSquare () {
    await this.expandMenuSection(mapPage.locationMenuSection)
    await this.chooseMenuOption(mapPage.addSquareOption)
  }

  async confirmBoundaryAndContinue () {
    await this.clickButton(mapPage.finishButton)
    await this.clickButton(mapPage.getSummaryReportButton)
  }
}
