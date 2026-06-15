import { expect } from '@playwright/test'
import { FormDriver } from './form-driver.js'
import * as mapPage from '../pages/map.page.js'

export class MapDriver extends FormDriver {
  async getFeatureToggle (element) {
    const switchToggle = this.page.getByRole('switch', { name: element.text, exact: true }).first()
    if (await switchToggle.count()) {
      return switchToggle
    }
    const checkboxToggle = this.page.getByRole('checkbox', { name: element.text, exact: true }).first()
    if (await checkboxToggle.count()) {
      return checkboxToggle
    }
    throw new Error(`getFeatureToggle(): no switch or checkbox found for '${element.text}'`)
  }

  // ---- Actions ---- //

  async waitForMapToLoad () {
    await expect(this.page.locator('#map-viewport')).toBeVisible()
    await expect(this.page.getByRole('slider', { name: 'Layer opacity' })).toBeVisible()
  }

  async expandSection (name) {
    const button = this.page.getByRole('button', { name: new RegExp(name) }).first()
    const expanded = await button.getAttribute('aria-expanded')
    if (expanded !== 'true') {
      await button.click()
    }
  }

  async chooseMenuOption (element) {
    if (element.type === 'menuButtonOption') {
      await this.page.getByRole('button', { name: element.text, exact: true }).first().click()
      return
    }
    if (element.type === 'menuRadioOption') {
      await this.page.getByRole('radio', { name: element.text, exact: true }).check({ force: true })
      return
    }
    throw new Error(`chooseMenuOption(): unsupported element type '${element.type}'`)
  }

  async openSearch () {
    await this.page.getByRole('button', { name: /search/i }).first().click()
  }

  async search (query) {
    await this.page.getByRole('combobox').fill(query)
  }

  async selectSearchResult () {
    const input = this.page.getByRole('combobox')
    await input.press('ArrowDown')
    await input.press('Enter')
    await this.page.waitForLoadState('networkidle')
  }

  async dismissPanel (name) {
    await this.page.getByRole('dialog', { name }).getByRole('button', { name: /close/i }).click()
  }

  async dismissBanner (text) {
    const banner = this.page.getByRole('status').filter({ hasText: text }).first()
    await banner.locator('..').getByRole('button', { name: /close/i }).click()
  }

  async zoomIn (times = 3) {
    for (let i = 0; i < times; i++) {
      await this.clickButton(mapPage.zoomInButton)
      await this.page.waitForLoadState('networkidle')
    }
  }

  async addSquare () {
    await this.clickButton(mapPage.addSquareOption)
  }

  async confirmBoundaryAndContinue () {
    await this.clickButton(mapPage.finishButton)
    await this.clickButton(mapPage.getSummaryReportButton)
  }

  // ---- Assertions ---- //

  async expectSectionVisible (name) {
    await expect(this.page.getByRole('button', { name: new RegExp(name) }).first()).toBeVisible()
  }

  async expectVisible (role, name) {
    const opts = name instanceof RegExp ? { name } : { name, exact: true }
    await expect(this.page.getByRole(role, opts).first()).toBeVisible()
  }

  async expectHidden (role, name) {
    const opts = name instanceof RegExp ? { name } : { name, exact: true }
    await expect(this.page.getByRole(role, opts).first()).toBeHidden()
  }

  async expectEnabled (element) {
    const button = this.page.getByRole('button', { name: element.text, exact: true }).first()
    await expect(button).toBeVisible()
    const disabled = await button.getAttribute('disabled')
    const ariaDisabled = await button.getAttribute('aria-disabled')
    expect(disabled === null && ariaDisabled !== 'true').toBe(true)
  }

  async expectDisabled (element) {
    const button = this.page.getByRole('button', { name: element.text, exact: true }).first()
    await expect(button).toBeVisible()
    const disabled = await button.getAttribute('disabled')
    const ariaDisabled = await button.getAttribute('aria-disabled')
    expect(disabled !== null || ariaDisabled === 'true').toBe(true)
  }

  async expectSliderAttributes (name, attrs) {
    const slider = this.page.getByRole('slider', { name })
    await expect(slider).toBeVisible()
    for (const [attr, value] of Object.entries(attrs)) {
      if (value instanceof RegExp) {
        const actual = await slider.getAttribute(attr)
        expect(actual).toMatch(value)
      } else {
        await expect(slider).toHaveAttribute(attr, value)
      }
    }
  }

  async expectUrlChanged (prevUrl) {
    await expect(this.page).not.toHaveURL(prevUrl)
  }

  // ---- Composite assertions ---- //

  async assertRadiosUpdateMap (options) {
    for (const opt of options) {
      await expect(this.page.getByRole('radio', { name: opt.text, exact: true })).toBeVisible()
    }
    await this.chooseMenuOption(options[0])
    let prevUrl = this.page.url()
    for (const option of options.slice(1)) {
      await this.chooseMenuOption(option)
      await expect(this.page).not.toHaveURL(prevUrl)
      prevUrl = this.page.url()
    }
  }

  async assertSwitchUpdatesKey (element) {
    const keyDialog = this.page.getByRole('dialog', { name: /^key$/i })
    await expect(keyDialog).toBeVisible()

    const toggle = await this.getFeatureToggle(element)
    await expect(toggle).toBeVisible()
    await expect(toggle).not.toBeChecked()

    const before = (await keyDialog.textContent()) ?? ''
    await toggle.click()

    await expect(toggle).toBeChecked()
    await expect(keyDialog).not.toHaveText(before, { timeout: 10000 })
  }
}
