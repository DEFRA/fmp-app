import { FormDriver } from './form-driver.js'

export class Steps {
  constructor ({ driver = new FormDriver() } = {}) {
    this.driver = driver
  }

  async open (page) {
    this.validatePage(page, 'open')
    await this.driver.open(page.slug)
    await this.driver.assertTitle(page.title)
  }

  async choose (element) {
    this.validateElement(element, 'choose')
    if (element.type === 'radioOption') {
      return this.driver.selectRadioByLabel(element.text)
    }
    if (element.type === 'checkboxOption') {
      return this.driver.selectCheckboxByLabel(element.text)
    }
    throw new Error(`Steps.choose(): unsupported handle type '${element.type}'`)
  }

  async type (element, value) {
    this.validateElement(element, 'type')
    if (element.type !== 'textInput') {
      throw new Error(`Steps.type(): unsupported handle type '${element.type}'`)
    }
    return this.driver.enterTextByLabel(element.text, value)
  }

  async select (element, value) {
    this.validateElement(element, 'select')
    if (element.type !== 'selectInput') {
      throw new Error(`Steps.select(): unsupported handle type '${element.type}'`)
    }
    if (element.id) {
      return this.driver.selectDropdownById(element.id, value)
    }
    return this.driver.selectDropdownByLabel(element.text, value)
  }

  async clickLink (element) {
    this.validateElement(element, 'clickLink')
    if (element.type !== 'link') {
      throw new Error(`Steps.clickLink(): unsupported handle type '${element.type}'`)
    }
    return this.driver.clickLink(element.text)
  }

  async clickButton (element) {
    this.validateElement(element, 'clickButton')
    if (element.type !== 'button') {
      throw new Error(`Steps.clickButton(): unsupported handle type '${element.type}'`)
    }
    return this.driver.clickButton(element.text)
  }

  async submit () {
    return this.driver.clickContinue()
  }

  async chooseAndSubmit (element) {
    await this.choose(element)
    await this.submit()
  }

  async expectOn (page) {
    this.validatePage(page, 'expectOn')
    await this.driver.assertTitle(page.title)
  }

  async expectErrorIsVisible () {
    await this.driver.assertErrorSummaryVisible()
  }

  async expectErrorText (text) {
    this.validateElement(text, 'expectErrorText')
    if (text.type !== 'errorText') {
      throw new Error(`Steps.expectErrorText(): unsupported handle type '${text.type}'`)
    }
    return this.driver.assertErrorSummaryText(text.text)
  }

  async expectText (text) {
    return this.driver.assertMainContainsText(text)
  }

  async expectLinkExists (element) {
    this.validateElement(element, 'expectLinkExists')
    if (element.type !== 'link') {
      throw new Error(`Steps.expectLinkExists(): unsupported handle type '${element.type}'`)
    }
    return this.driver.assertLinkPresence(element, true)
  }

  async expectLinkNotExists (element) {
    this.validateElement(element, 'expectLinkNotExists')
    if (element.type !== 'link') {
      throw new Error(`Steps.expectLinkNotExists(): unsupported handle type '${element.type}'`)
    }
    return this.driver.assertLinkPresence(element, false)
  }

  async expectButtonExists (element) {
    this.validateElement(element, 'expectButtonExists')
    if (element.type !== 'button') {
      throw new Error(`Steps.expectButtonExists(): unsupported handle type '${element.type}'`)
    }
    return this.driver.assertButtonPresence(element, true)
  }

  async expectButtonNotExists (element) {
    this.validateElement(element, 'expectButtonNotExists')
    if (element.type !== 'button') {
      throw new Error(`Steps.expectButtonNotExists(): unsupported handle type '${element.type}'`)
    }
    return this.driver.assertButtonPresence(element, false)
  }

  async expectUrlContains (substring) {
    return this.driver.assertUrlContains(substring)
  }

  async switchToNewWindow () {
    return this.driver.switchToNewWindow()
  }

  validatePage (page, method) {
    if (!page?.slug || !page?.title) {
      throw new Error(`Steps.${method}(): invalid page definition`)
    }
  }

  validateElement (element, method) {
    if (!element?.type || !element?.text) {
      throw new Error(`Steps.${method}(): invalid element (expected { type, text })`)
    }
  }
}
