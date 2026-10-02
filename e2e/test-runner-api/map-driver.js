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
    await this.page.waitForLoadState('networkidle')
  }

  async expandSection (name) {
    const button = this.page.getByRole('button', { name: new RegExp(`^${name}$`) }).first()
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
    if (element.type === 'menuItemOption') {
      await this.page.getByRole('menuitem', { name: element.text, exact: true }).first().click()
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

  async zoomIn (times = 3) {
    const zoom = async (remaining) => {
      if (remaining <= 0) return
      await this.clickButton(mapPage.zoomInButton)
      await this.page.waitForLoadState('networkidle')
      await zoom(remaining - 1)
    }
    await zoom(times)
  }

  async addSquare () {
    await this.chooseMenuOption(mapPage.addSquareOption)
  }

  async confirmBoundaryAndContinue () {
    await this.clickButton(mapPage.frameDoneButton)
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
    const item = this.page.getByRole('menuitem', { name: element.text, exact: true }).first()
    await expect(item).toBeVisible()
    const ariaDisabled = await item.getAttribute('aria-disabled')
    expect(ariaDisabled !== 'true').toBe(true)
  }

  async expectDisabled (element) {
    const item = this.page.getByRole('menuitem', { name: element.text, exact: true }).first()
    await expect(item).toBeVisible()
    const ariaDisabled = await item.getAttribute('aria-disabled')
    expect(ariaDisabled).toBe('true')
  }

  async expectSliderAttributes (name, attrs) {
    const slider = this.page.getByRole('slider', { name })
    await expect(slider).toBeVisible()
    await Promise.all(Object.entries(attrs).map(async ([attr, value]) => {
      if (value instanceof RegExp) {
        const actual = await slider.getAttribute(attr)
        expect(actual).toMatch(value)
        return
      }
      await expect(slider).toHaveAttribute(attr, value)
    }))
  }

  async expectUrlChanged (prevUrl) {
    await expect(this.page).not.toHaveURL(prevUrl)
  }

  // ---- Composite assertions ---- //

  async assertRadiosUpdateMap (options) {
    await Promise.all(options.map((opt) => expect(this.page.getByRole('radio', { name: opt.text, exact: true })).toBeVisible()))
    await this.chooseMenuOption(options[0])
    let prevUrl = this.page.url()

    const iterateOptions = async (remainingOptions) => {
      if (remainingOptions.length === 0) return
      const option = remainingOptions[0]
      await this.chooseMenuOption(option)
      await expect(this.page).not.toHaveURL(prevUrl)
      prevUrl = this.page.url()
      await iterateOptions(remainingOptions.slice(1))
    }

    await iterateOptions(options.slice(1))
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
