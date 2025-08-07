const expectedContent = (selector, expectedCopy) => {
  try {
    const element = document.querySelector(selector)
    if (expectedCopy) {
    // the REGEX trims all whitespace and only compares the actual text that will be rendered.
      expect(element.textContent.replace(/\s\s+/g, ' ').trim())
        .toContain(expectedCopy.replace(/\s\s+/g, ' ').trim())
    } else {
      expect(element).toBeNull()
    }
  } catch (error) {
    // This Assert only runs when the expected assert fails.
    // It is added as the exact location of the failure is hard to infer, when a fail occurs
    // and this helps give a more meaningful failure message.
    const failMessage = `expected selector ${selector} to contain ${expectedCopy || 'NO CONTENT'}`
    expect(failMessage).toBeNull()
  }
}

module.exports = { expectedContent }
