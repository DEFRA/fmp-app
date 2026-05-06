import { expect } from '@playwright/test'

export class FormDriver {
  constructor (page) {
    this.page = page
  }

  // ---- Navigation ---- //

  async open (pageDef) {
    await this.page.goto(pageDef.slug)
    await this.expectOn(pageDef)
  }

  async submit () {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click()
  }

  // ---- Actions ---- //

  async choose (element) {
    if (element.type === 'radioOption') {
      await this.page.getByRole('radio', { name: element.text, exact: true }).check()
      return
    }
    if (element.type === 'checkboxOption') {
      await this.page.getByRole('checkbox', { name: element.text, exact: true }).check()
      return
    }
    throw new Error(`choose(): unsupported element type '${element.type}'`)
  }

  async chooseAndSubmit (element) {
    await this.choose(element)
    await this.submit()
  }

  async type (element, value) {
    const textbox = this.page.getByRole('textbox', { name: element.text })
    const spinbutton = this.page.getByRole('spinbutton', { name: element.text })
    const target = textbox.or(spinbutton)
    await expect(target).toBeVisible()
    if (await textbox.count()) {
      await textbox.fill(value)
    } else {
      await spinbutton.pressSequentially(String(value))
    }
  }

  async select (element, value) {
    await this.page.getByLabel(element.text, { exact: true }).selectOption(value)
  }

  async clickButton (element) {
    await this.page.getByRole('button', { name: element.text, exact: true }).click()
  }

  async clickDetails (element) {
    await this.page.locator('details').filter({ hasText: element.text }).locator('summary').click()
  }

  async clickLink (element) {
    const locator = this.#getLinkLocator(element)
    // Some pages legitimately contain duplicate link text; click the first visible match.
    await expect(locator.first()).toBeVisible()
    await locator.first().click()
  }

  async clickLinkContainingText (element) {
    const locator = this.#getLinkLocator(element, false)
    await expect(locator.first()).toBeVisible()
    await locator.first().click()
  }

  async switchToNewWindow () {
    const context = this.page.context()
    const allPages = context.pages()
    let newPage
    if (allPages.length > 1) {
      newPage = allPages[allPages.length - 1]
    } else {
      newPage = await context.waitForEvent('page')
    }
    await newPage.waitForLoadState()
    this.page = newPage
  }

  // ---- Assertions ---- //

  async expectOn (pageDef) {
    await expect(this.page.getByRole('heading', { name: pageDef.title, exact: true })).toBeVisible()
  }

  async expectText (text) {
    await expect(this.page.getByRole('main')).toContainText(text)
  }

  async expectErrorText (element) {
    await expect(this.page.getByRole('alert')).toBeVisible()
    await expect(this.page.getByRole('alert')).toContainText(element.text)
  }

  async expectLinkExists (element) {
    const locator = this.#getLinkLocator(element)
    await expect(locator.first()).toBeVisible()
    if (element.url) {
      await expect(locator.first()).toHaveAttribute('href', new RegExp(element.url))
    }
  }

  async expectLinkTargetReachable (element) {
    const locator = this.#getLinkLocator(element)
    await expect(locator.first()).toBeVisible()
    const href = await locator.first().getAttribute('href')
    const url = new URL(href, this.page.url())
    const response = await this.page.request.head(url.toString())
    const successResponse = 200
    expect(response.status()).toBe(successResponse)
  }

  async expectLinkNotExists (element) {
    await expect(this.#getLinkLocator(element)).toHaveCount(0)
  }

  async expectButtonExists (element) {
    await expect(this.page.getByRole('button', { name: element.text, exact: true })).toBeVisible()
  }

  async expectButtonNotExists (element) {
    await expect(this.page.getByRole('button', { name: element.text, exact: true })).toBeHidden()
  }

  async expectUrlContains (substring) {
    const escaped = substring.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    await expect(this.page).toHaveURL(new RegExp(escaped))
  }

  // ---- Private ---- //

  #getLinkLocator (link, exact = true) {
    if (link.type === 'footerLink') {
      return this.page.locator('footer').getByRole('link', { name: link.text, exact })
    }
    if (link.type === 'headerLink') {
      return this.page.locator('header, .govuk-service-navigation, .govuk-phase-banner').getByRole('link', { name: link.text, exact })
    }
    if (link.type === 'mapLink') {
      return this.page.getByRole('link', { name: link.text, exact })
    }
    if (link.type === 'mainLink' || link.type === 'link') {
      return this.page.getByRole('main').getByRole('link', { name: link.text, exact })
    }
    throw new Error(`Unsupported link type '${link.type}'`)
  }
}
