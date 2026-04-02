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

  async clickLink (element) {
    const locator = this.#getLinkLocator(element)
    await locator.click()
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
    const count = await locator.count()
    expect(count).toBeGreaterThan(0)
    const target = count > 1 ? locator.first() : locator
    await expect(target).toBeVisible()
    if (element.url) {
      const href = await target.getAttribute('href')
      if (href) {
        expect(href).toContain(element.url)
      }
    }
  }

  async expectLinkNotExists (element) {
    expect(await this.#getLinkLocator(element).count()).toBe(0)
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

  #getLinkLocator (link) {
    if (link.type === 'footerLink') {
      return this.page.locator('footer').getByRole('link', { name: link.text, exact: true })
    }
    if (link.type === 'headerLink') {
      return this.page.locator('header, .govuk-service-navigation, .govuk-phase-banner').getByRole('link', { name: link.text, exact: true })
    }
    if (link.type === 'mainLink' || link.type === 'link') {
      return this.page.getByRole('main').getByRole('link', { name: link.text, exact: true })
    }
    throw new Error(`Unsupported link type '${link.type}'`)
  }
}
