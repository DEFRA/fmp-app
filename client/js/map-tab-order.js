const getKeyboardFocusableElements = (element = document) => [...element.querySelectorAll(
  'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
)].filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))

const setTabActions = (element, nextElement, previousElement) => {
  if (!element) {
    return
  }
  element.addEventListener('keydown', event => {
    if (event.which === 9) {
      if (event.shiftKey && previousElement) {
        previousElement.focus()
        event.preventDefault()
      } else if (!event.shiftKey && nextElement) {
        nextElement.focus()
        event.preventDefault()
      }
    }
  })
}

const fixMapTabOrder = (container = document) => {
  const figureSelector = 'figure.map-container'
  const figureElement = container.querySelector(figureSelector)
  const zoomInElement = figureElement ? figureElement.querySelector('.ol-zoom-in') : undefined
  const zoomOutElement = figureElement ? figureElement.querySelector('.ol-zoom-out') : undefined
  const osTermsElement = figureElement ? figureElement.querySelector('a[href$="os-terms"]') : undefined
  const attributionsElement = figureElement ? figureElement.querySelector('[title="Attributions"]') : undefined

  let figureFound = false
  const nextFocussableElement = getKeyboardFocusableElements(container).find(element => {
    if (figureFound === false && element.closest(figureSelector)) {
      figureFound = true
    }
    return figureFound && !element.closest(figureSelector)
  })

  // setTabActions(element, nextTabbableElement, previousTabbableElement)
  setTabActions(zoomOutElement, attributionsElement, zoomInElement)
  setTabActions(attributionsElement, osTermsElement, zoomOutElement)
  setTabActions(osTermsElement, nextFocussableElement, attributionsElement)
  setTabActions(nextFocussableElement, undefined, osTermsElement)
  // Remove the tabIndex on the map elements that were breaking the tab order flow
  // they are now handled by code.
  if (osTermsElement) {
    osTermsElement.tabIndex = '-1'
  }
  if (attributionsElement) {
    attributionsElement.tabIndex = '-1'
  }
}

module.exports = { fixMapTabOrder, setTabActions, getKeyboardFocusableElements }
