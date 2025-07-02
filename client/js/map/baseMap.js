const mapStyles = {}
let mapStylesSelector = ''

// TEMPORARY HACK while we await https://eaflood.atlassian.net/browse/FMC-188
const replaceButtonText = (buttonElement, replaceText) => {
  if (!buttonElement) {
    return
  }
  const textNode = [...buttonElement.childNodes].find((node) => node.nodeType === window.Node.TEXT_NODE)
  if (textNode) {
    textNode.textContent = replaceText
  } else {
    buttonElement.appendChild(document.createTextNode(replaceText))
  }
}

const observer = new window.MutationObserver((mutations) => {
  // addedNodes is an array of NodeLists, which is an array of Nodes
  const addedNodes = mutations.map(({ addedNodes: sonarAddedNodes }) => sonarAddedNodes)
  // reduce the addedNodes to the buttons we require
  const buttons = [
    ...addedNodes.reduce((foundButtons, nodeList) =>
      foundButtons.concat([...nodeList].reduce((nestedButtons, node) => {
        if (node.querySelectorAll) {
          return nestedButtons.concat([...node.querySelectorAll(mapStylesSelector)])
        }
        return nestedButtons
      }, []))
    , [])]
  // Set the Button Text to the correct Value
  buttons.forEach((button) => replaceButtonText(button, mapStyles[button.value].displayName))
})
// END OF TEMPORARY HACK

const setUpBaseMaps = (osAccountNumber) => {
  const currentYear = new Date().getFullYear()
  const osAttributionHyperlink = `<a href="/os-terms" class="os-credits__link"> Contains OS data &copy; Crown copyright and database rights ${currentYear} </a>`
  const osMasterMapAttributionHyperlink = `<a href="/os-terms" class="os-credits__link">&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber} </a>`
  Object.assign(mapStyles, {
    default: {
      displayName: 'Outdoor',
      url: '/map/styles/base-map-default',
      attribution: osAttributionHyperlink,
      digitisingUrl: '/map/styles/polygon-default',
      digitisingAttribution: osMasterMapAttributionHyperlink
    },
    dark: {
      displayName: 'Dark',
      url: '/map/styles/base-map-dark',
      attribution: osAttributionHyperlink,
      digitisingUrl: '/map/styles/polygon-default',
      digitisingAttribution: osMasterMapAttributionHyperlink
    },
    // ideally we change this from tritanopia to blackAndWhite.
    // But we have to use tritanopia, otherwise the MC forgets the setting
    tritanopia: {
      displayName: 'Black and white',
      // will be replaced with open version of map and apply over-zoom and wonky road name changes
      url: '/map/styles/base-map-black-and-white',
      attribution: osAttributionHyperlink,
      digitisingUrl: '/map/styles/base-map-black-and-white',
      digitisingAttribution: osMasterMapAttributionHyperlink
    }
  })

  const baseMapStyles = Object.entries(mapStyles)
    .map(([name, { url, attribution }]) => ({ name, url, attribution }))

  const digitisingMapStyles = Object.entries(mapStyles)
    .map(([name, { digitisingUrl: url, digitisingAttribution: attribution }]) => ({ name, url, attribution }))

  // TEMPORARY HACK while we await https://eaflood.atlassian.net/browse/FMC-188
  // Build the selector for the names we need to change at runtime
  mapStylesSelector = Object.keys(mapStyles)
    .reduce((selector, styleName) => selector.concat(`button[value="${styleName}"]`), []).join()
  // Start the observer to capture any mutations to the DOM
  // and then replace the hard coded component names, with our names
  observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true })
  // END OF TEMPORARY HACK

  return { mapStyles, baseMapStyles, digitisingMapStyles }
}

export { setUpBaseMaps }
