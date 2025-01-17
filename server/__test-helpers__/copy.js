
const assertCopy = (selector, expectedCopy) => {
  const element = document.querySelector(selector)
  if (expectedCopy) {
    // the REGEX trims all whitespace and only compares the actual text that will be rendered
    expect(element.textContent.replace(/\s\s+/g, ' ').trim())
      .toContain(expectedCopy.replace(/\s\s+/g, ' ').trim())
  } else {
    expect(element).toBeNull()
  }
}

module.exports = { assertCopy }
