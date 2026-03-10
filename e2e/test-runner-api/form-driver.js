export class FormDriver {
  // ----ACTION METHODS---- //
  async open (slug) {
    await browser.url(slug)
  }

  async clickContinue () {
    const continueButton = await $('aria/Continue')
    await continueButton.waitForClickable({ timeout: 3000 })
    await continueButton.click()
  }

  async clickButton (buttonText) {
    const button = await $(`.govuk-button=${buttonText}`)
    await button.waitForClickable({ timeout: 5000 })
    await button.click()
  }

  async clickLink (linkText) {
    // Prefer anchor tag and link text
    let link = await $(`a=${linkText}`)
    const exists = await link.isExisting()
    if (!exists) {
      // Fallback to accessible name
      link = await $(`aria/${linkText}`)
    }
    await link.waitForClickable({ timeout: 3000 })
    await link.click()
  }

  async selectRadioByLabel (optionText) {
    const radioOption = await $(`.govuk-radios__label=${optionText}`)
    await radioOption.waitForClickable({ timeout: 3000 })
    await radioOption.click()
  }

  async selectCheckboxByLabel (optionText) {
    const checkboxOption = await $(`.govuk-checkboxes__label=${optionText}`)
    await checkboxOption.waitForClickable({ timeout: 3000 })
    await checkboxOption.click()
  }

  async enterTextByLabel (labelText, value) {
    // Resolve the input via its associated label's "for" attribute
    // For GDS conditional reveal patterns, we need to find the label inside the conditional panel
    const labels = await $$(`label=${labelText}`)

    let input
    // Try each label to find one with a valid 'for' attribute
    for (const label of labels) {
      const id = await label.getAttribute('for')
      if (id) {
        const potentialInput = await $(`#${id}`)
        const tagName = await potentialInput.getTagName()
        const type = await potentialInput.getAttribute('type')
        // Check if it's an actual text input, not a radio
        if (tagName === 'input' && type !== 'radio' && type !== 'checkbox') {
          input = potentialInput
          break
        }
      }
    }

    // Fallback to aria if no suitable label found
    if (!input) {
      input = await $(`aria/${labelText}`)
    }

    await input.waitForEnabled({ timeout: 3000 })
    await input.setValue(value)
  }

  async selectDropdownByLabel (labelText, optionValue) {
    // Find the label and get its 'for' attribute
    const label = await $(`label=${labelText}`)
    const selectId = await label.getAttribute('for')

    // Find the select element by ID
    const selectElement = await $(`#${selectId}`)
    await selectElement.waitForEnabled({ timeout: 3000 })

    // Select the option by value
    await selectElement.selectByAttribute('value', optionValue)
  }

  // ----ASSERTION METHODS---- //
  async assertTitle (expectedTitle) {
    const headerTag = await $('h1')
    await headerTag.waitForExist({ timeout: 3000 })
    await expect(headerTag).toHaveText(expectedTitle)
  }

  async assertErrorSummaryVisible () {
    const summary = await $('.govuk-error-summary')
    await summary.waitForExist({ timeout: 3000 })
    await expect(summary).toBeDisplayed()
  }

  async assertErrorSummaryText (expectedText) {
    await this.assertErrorSummaryVisible()
    const list = await $('.govuk-error-summary__list')
    await list.waitForExist({ timeout: 3000 })
    const actualText = await list.getText()
    expect(actualText).toContain(expectedText)
  }

  async assertMainContainsText (expectedText) {
    const actual = await this.getMainText()
    const actualTrimmed = actual.toString().replace(/\s/g, '')
    const expectedTrimmed = expectedText.toString().replace(/\s/g, '')
    expect(actualTrimmed).toContain(expectedTrimmed)
  }

  async assertLinkPresence (link, shouldExist = true) {
    // Try both aria and text-based selectors for links
    const linkLabelByText = await $(`a=${link.text}`)
    const linkLabelByAria = await $(`aria/${link.text}`)

    const existsByText = await linkLabelByText.isExisting()
    const existsByAria = await linkLabelByAria.isExisting()
    const exists = existsByText || existsByAria

    expect(exists).toBe(shouldExist)

    // If URL is specified and link should exist, verify the href contains the URL
    if (shouldExist && link.url && exists) {
      const resolvedLink = existsByText ? linkLabelByText : linkLabelByAria
      const href = await resolvedLink.getAttribute('href')
      if (href) {
        expect(href).toContain(link.url)
      }
    }
  }

  async assertButtonPresence (button, shouldExist = true) {
    const buttonByText = await $(`button=${button.text}`)
    const buttonByClassAndText = await $(`.govuk-button=${button.text}`)

    const existsByText = await buttonByText.isExisting()
    const existsByClassAndText = await buttonByClassAndText.isExisting()
    const exists = existsByText || existsByClassAndText

    expect(exists).toBe(shouldExist)
  }

  async assertUrlContains (expectedSubstring) {
    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl()
        return url.includes(expectedSubstring)
      },
      {
        timeout: 5000,
        timeoutMsg: `Expected URL to contain "${expectedSubstring}"`
      }
    )
    const url = await browser.getUrl()
    expect(url).toContain(expectedSubstring)
  }

  // TODO: This needs to be more robust. It should check the URL
  // of the new window and wait for it to load, rather than just switching immediately
  // after detecting a new window handle. It should also handle the case where multiple
  // windows are opened and ensure it switches to the correct one.
  async switchToNewWindow () {
    const originalHandle = await browser.getWindowHandle()
    // Wait for new window to appear
    await browser.waitUntil(
      async () => {
        const handles = await browser.getWindowHandles()
        return handles.length > 1
      },
      { timeout: 5000, timeoutMsg: 'New window did not open' }
    )

    const handles = await browser.getWindowHandles()
    const newHandle = handles.find(handle => handle !== originalHandle)
    await browser.switchToWindow(newHandle)

    // Wait for the new window to load (not be about:blank)
    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl()
        return url !== 'about:blank' && url !== ''
      },
      { timeout: 5000, timeoutMsg: 'New window did not load a URL' }
    )
  }

  // -----GETTERS----- //
  async getMainText () {
    const main = await $('main')
    await main.waitForExist({ timeout: 3000 })
    return main.getText()
  }
}
