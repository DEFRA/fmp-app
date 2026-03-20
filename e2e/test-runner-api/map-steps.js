import { MapDriver } from './map-driver.js'

export class MapSteps {
  constructor (page, { driver } = {}) {
    this.driver = driver || new MapDriver(page)
  }

  async waitForMapToLoad () {
    return this.driver.mapLoaded()
  }

  async clickButton (element) {
    this.validateElement(element, 'clickButton')
    if (element.type !== 'mapButton') {
      throw new Error(`MapSteps.clickButton(): unsupported handle type '${element.type}'`)
    }
    return this.driver.clickButton(element.text)
  }

  async expandMenuSection (element) {
    this.validateElement(element, 'expandMenuSection')
    if (element.type !== 'menuSection') {
      throw new Error(`MapSteps.expandMenuSection(): unsupported handle type '${element.type}'`)
    }
    return this.driver.expandMenuSection(element.text)
  }

  async chooseMenuOption (element) {
    this.validateElement(element, 'chooseMenuOption')
    if (element.type === 'menuButtonOption') {
      return this.driver.selectMenuButtonOption(element.text)
    }
    if (element.type === 'menuRadioOption') {
      return this.driver.selectMenuRadioOption(element.text)
    }
    if (element.type === 'menuCheckboxOption') {
      return this.driver.selectMenuCheckboxOption(element.text)
    }
    throw new Error(`MapSteps.chooseMenuOption(): unsupported handle type '${element.type}'`)
  }

  async zoomIn (times = 3) {
    return this.driver.zoomIn(times)
  }

  async addSquare () {
    await this.expandMenuSection({ type: 'menuSection', text: 'Get data for your location' })
    await this.chooseMenuOption({ type: 'menuButtonOption', text: 'Add square' })
  }

  async confirmBoundaryAndContinue () {
    await this.clickButton({ type: 'mapButton', text: 'Finish' })
    await this.clickButton({ type: 'mapButton', text: 'Get summary report' })
  }

  validateElement (element, method) {
    if (!element?.type || !element?.text) {
      throw new Error(`MapSteps.${method}(): invalid element (expected { type, text })`)
    }
  }
}
