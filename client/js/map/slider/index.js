import sliderMarkUp from './slider.html.js'
import { OpacitySlider } from './slider.js'
const id = 'opacity-control'
let opacitySlider

const observer = new window.MutationObserver((mutations) => {
  // addedNodes is an array of NodeLists, which is an array of Nodes
  const addedNodes = [...mutations.map(({ addedNodes: sonarAddedNodes }) => sonarAddedNodes)]
  const sliderElement = addedNodes.reduce((sliderNode, nodeList) => {
    sliderNode = sliderNode || [...nodeList].reduce((childSliderNode, node) => {
      childSliderNode = childSliderNode || node.querySelector('#opacity-control')
      return childSliderNode
    }, null)
    return sliderNode
  }, null)
  if (sliderElement) {
    createOpacitySlider(sliderElement)
  }
})

const createOpacitySlider = (sliderElement) => {
  opacitySlider = new OpacitySlider(sliderElement)
  opacitySlider.init()
}

const initialiseSlider = () => {
  const sliderElement = document.getElementById(id)

  let opacityContainer = '.fm-o-side' // On non-mobile sliderElement is in the fm-o-side element
  if (sliderElement) { // On the desktop, the element should exist
    createOpacitySlider(sliderElement)
  } else { // On mobile sliderElement is in the fm-o-middle element and won't appear until the layers menu is shown
    opacityContainer = '.fm-o-middle'
  }
  // Now create an observer that will re-create the slider every time it goes away.
  // EG On Mobile when the layers menu is shown, on desktop when edit mode is exited.
  const mapOpacityContainer = document.querySelector(opacityContainer)
  observer.observe(mapOpacityContainer, { attributes: false, childList: true, characterData: false, subtree: false })
}

export { sliderMarkUp, initialiseSlider }
