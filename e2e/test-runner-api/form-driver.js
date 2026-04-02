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

  async clickLink (link) {
    if (link.type === 'footerLink') {
      await this.page.locator('footer').getByRole('link', { name: link.text, exact: true }).first().click()
      return
    }
    if (link.type === 'headerLink') {
      await this.page.locator('header, .govuk-service-navigation, .govuk-phase-banner').getByRole('link', { name: link.text, exact: true }).first().click()
      return
    }
    if (link.type === 'mainLink' || link.type === 'link') {
      await this.page.getByRole('main').getByRole('link', { name: link.text, exact: true }).first().click()
      return
    }
    throw new Error(`Unsupported link type '${link.type}'`)
  }

  async selectRadioByLabel (optionText) {
    await this.page.getByRole('radio', { name: optionText, exact: true }).check()
  }

  async selectCheckboxByLabel (optionText) {
    await this.page.getByRole('checkbox', { name: optionText, exact: true }).check()
  }

  async enterTextByLabel (labelText, value) {
    const textbox = this.page.getByRole('textbox', { name: labelText })
    const spinbutton = this.page.getByRole('spinbutton', { name: labelText })
    const target = textbox.or(spinbutton)
    await expect(target).toBeVisible()
    if (await textbox.count()) {
      await textbox.fill(value)
    } else {
      await spinbutton.pressSequentially(String(value))
    }
  }

  async selectDropdownByLabel (labelText, optionValue) {
    await this.page.getByLabel(labelText, { exact: true }).selectOption(optionValue)
  }

  // ----ASSERTION METHODS---- //
  async assertTitle (expectedTitle) {
    await expect(this.page.getByRole('heading', { name: expectedTitle, exact: true })).toBeVisible()
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
    const linkElement = link.type === 'footerLink'
      ? this.page.locator('footer').getByRole('link', { name: link.text, exact: true })
      : link.type === 'headerLink'
        ? this.page.locator('header, .govuk-service-navigation, .govuk-phase-banner').getByRole('link', { name: link.text, exact: true })
        : link.type === 'mainLink' || link.type === 'link'
          ? this.page.getByRole('main').getByRole('link', { name: link.text, exact: true })
          : null

    if (!linkElement) {
      throw new Error(`Unsupported link type '${link.type}'`)
    }

    const count = await linkElement.count()

    if (shouldExist) {
      expect(count).toBeGreaterThan(0)
      // Use .first() only when there are genuine duplicates (e.g. same email
      // link repeated in different sections) to avoid Playwright strict-mode
      // errors while still getting strict-mode protection for single matches.
      const target = count > 1 ? linkElement.first() : linkElement
      await expect(target).toBeVisible()
      if (link.url) {
        const href = await target.getAttribute('href')
        if (href) {
          expect(href).toContain(link.url)
        }
      }
    } else {
      expect(count).toBe(0)
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
