import { expect } from '@playwright/test'
import { FormDriver } from './form-driver.js'
import * as mapPage from '../pages/map.page.js'

const ARIA_DISABLED = 'aria-disabled'

export class MapDriver extends FormDriver {
  async waitForMapToLoad () {
    await expect(this.page.locator('#map-viewport')).toBeVisible()
    await this.page.waitForLoadState('networkidle')
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
      await this.page.getByRole('radio', { name: element.text, exact: true }).check({ force: true })
      return
    }
    if (element.type === 'menuCheckboxOption') {
      await this.page.getByRole('checkbox', { name: element.text, exact: true }).check({ force: true })
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

  // --- Map state helpers ---

  _norm (text) {
    return text.replace(/\s+/g, ' ').trim()
  }

  _snapChanged (before, after) {
    return (
      before.label !== after.label ||
      before.class !== after.class ||
      before.text !== after.text ||
      before.children !== after.children
    )
  }

  async getKeyText () {
    const kd = mapPage.getMapDialog(this.page, 'Key')
    return this._norm(await kd.innerText())
  }

  async getSectionText (title) {
    const btn = mapPage.getSectionButtonByTitle(this.page, title)
    await expect(btn).toBeVisible()
    return this._norm(await btn.innerText())
  }

  async getMapSnapshot () {
    const vp = mapPage.getMapViewport(this.page)
    await expect(vp).toBeVisible()
    return {
      label: await vp.getAttribute('aria-label'),
      class: await vp.getAttribute('class'),
      text: this._norm(await vp.innerText().catch(() => '')),
      children: await vp.locator('*').count().catch(() => 0)
    }
  }

  async waitForMapToSettle () {
    const kd = mapPage.getMapDialog(this.page, 'Key')
    await expect(kd).toBeVisible()
    await this.page.waitForLoadState('networkidle')
    await expect.poll(async () => (await this.getKeyText()).length, {
      timeout: 10000,
      intervals: [200, 400, 800]
    }).toBeGreaterThan(0)
  }

  async assertRadioLayerChange (option, sectionTitle, prevState, { checkKey = true } = {}) {
    const radio = this.page.getByRole('radio', { name: option.text, exact: true })
    await this.chooseMenuOption(option)
    await expect(radio).toBeChecked()

    if (!prevState) {
      await this.waitForMapToSettle()
      return {
        query: new URL(this.page.url()).search,
        key: await this.getKeyText(),
        section: await this.getSectionText(sectionTitle),
        snap: await this.getMapSnapshot(),
        option
      }
    }

    const prevRadio = this.page.getByRole('radio', { name: prevState.option.text, exact: true })
    await expect(prevRadio).not.toBeChecked()

    await expect.poll(() => new URL(this.page.url()).search, {
      timeout: 10000,
      intervals: [200, 400, 800]
    }).not.toBe(prevState.query)

    await this.waitForMapToSettle()
    const state = {
      query: new URL(this.page.url()).search,
      key: await this.getKeyText(),
      section: await this.getSectionText(sectionTitle),
      snap: await this.getMapSnapshot(),
      option
    }

    const keyChanged = state.key !== prevState.key
    const sectionMatches = state.section !== prevState.section &&
      state.section.toLowerCase().includes(option.text.toLowerCase())
    const mapChanged = this._snapChanged(prevState.snap, state.snap)

    if (checkKey) {
      expect(keyChanged || sectionMatches || mapChanged).toBe(true)
    } else {
      expect(sectionMatches || mapChanged).toBe(true)
    }

    return state
  }

  async assertMultipleRadios (options, sectionTitle, { checkKey = true } = {}) {
    for (const opt of options) {
      await expect(this.page.getByRole('radio', { name: opt.text, exact: true })).toBeVisible()
    }
    let state = null
    for (const option of options) {
      state = await this.assertRadioLayerChange(option, sectionTitle, state, { checkKey })
    }
  }

  async dismissKeyPanel () {
    const kd = mapPage.getMapDialog(this.page, 'Key')
    await kd.getByRole('button', { name: mapPage.bannerCloseButton.text, exact: true }).click()
  }

  async dismissAlertBanner () {
    const closeBtn = mapPage.getAlertBannerCloseButton(this.page)
    await closeBtn.click()
  }
}
