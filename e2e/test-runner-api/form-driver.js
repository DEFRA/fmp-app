import { expect } from '@playwright/test'

export class FormDriver {
  constructor (page) {
    this.page = page
  }

  // ----ACTION METHODS---- //
  async open (slug) {
    await this.page.goto(slug)
  }

  async clickContinue () {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click()
  }

  async clickButton (buttonText) {
    const button = this.page.getByRole('button', { name: buttonText, exact: true })
    await button.click()
  }

  async clickLink (linkText) {
    const link = this.page.getByRole('link', { name: linkText, exact: true })
    await link.click()
  }

  async selectRadioByLabel (optionText) {
    await this.page.getByRole('radio', { name: optionText, exact: true }).check()
  }

  async selectCheckboxByLabel (optionText) {
    await this.page.getByRole('checkbox', { name: optionText, exact: true }).check()
  }

  async enterTextByLabel (labelText, value) {
    // GDS conditional reveal patterns can result in multiple labels with the same text
    // (one for the radio, one for the revealed text input). Filter to non-radio/checkbox inputs.
    const input = this.page.getByLabel(labelText, { exact: true }).and(
      this.page.locator('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), textarea')
    )
    const target = input
    try {
      await target.fill(String(value))
    } catch (err) {
      // Playwright can reject non-numeric strings for input[type=number].
      // Fall back to key entry so validation-path tests can proceed.
      await target.click()
      await target.press('ControlOrMeta+A')
      await target.press('Backspace')
      await target.pressSequentially(String(value))
    }
  }

  async selectDropdownByLabel (labelText, optionValue) {
    await this.page.getByLabel(labelText, { exact: true }).selectOption(optionValue)
  }

  // ----ASSERTION METHODS---- //
  async assertTitle (expectedTitle) {
    await expect(this.page.getByRole('heading', { level: 1, name: expectedTitle, exact: true })).toBeVisible()
  }

  async assertErrorSummaryVisible () {
    await expect(this.page.getByRole('alert')).toBeVisible()
  }

  async assertErrorSummaryText (expectedText) {
    await this.assertErrorSummaryVisible()
    await expect(this.page.getByRole('alert')).toContainText(expectedText)
  }

  async assertMainContainsText (expectedText) {
    await expect(this.page.getByRole('main')).toContainText(expectedText)
  }

  async assertLinkPresence (link, shouldExist = true) {
    const linkElement = this.page.getByRole('link', { name: link.text, exact: true })
    if (shouldExist) {
      await expect(linkElement).toBeVisible()
      if (link.url) {
        const href = await linkElement.getAttribute('href')
        if (href) {
          expect(href).toContain(link.url)
        }
      }
    } else {
      await expect(linkElement).toBeHidden()
    }
  }

  async assertButtonPresence (button, shouldExist = true) {
    const buttonElement = this.page.getByRole('button', { name: button.text, exact: true })
    if (shouldExist) {
      await expect(buttonElement).toBeVisible()
    } else {
      await expect(buttonElement).toBeHidden()
    }
  }

  async assertUrlContains (expectedSubstring) {
    const escaped = expectedSubstring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    await expect(this.page).toHaveURL(new RegExp(escaped))
  }

  async switchToNewWindow () {
    const context = this.page.context()
    const pages = context.pages()
    let newPage
    if (pages.length > 1) {
      newPage = pages[pages.length - 1]
    } else {
      newPage = await context.waitForEvent('page')
    }
    await newPage.waitForLoadState()
    this.page = newPage
  }
}
