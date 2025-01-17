
const assertCopy = (selector, expectedCopy) => {
  const element = document.querySelector(selector)
  if (expectedCopy) {
    expect(element.textContent).toContain(expectedCopy)
  } else {
    expect(element).toBeNull()
  }
}

module.exports = { assertCopy }
