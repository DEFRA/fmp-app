import { OpacitySlider } from './slider.js'
export { sliderMarkUp } from './slider.html.js'
const containerId = 'opacity-control'
let opacitySlider

const mapContainerObserver = new globalThis.MutationObserver((mutations) => {
  const addedNodes = mutations.map(({ addedNodes: newNodes }) => newNodes)
  if (addedNodes.length) {
    opacitySlider.checkAndAttach()
  }
})

const initialiseSlider = () => {
  opacitySlider = new OpacitySlider(containerId)
  opacitySlider.checkAndAttach()

  // Observe the container for addedNodes - ie when fm-o-side appears on browser resize from tablet => desktop
  const mapContainer = document.querySelector('.fm-o-container')
  mapContainerObserver.observe(mapContainer, { attributes: false, childList: true, characterData: false, subtree: true })
  return opacitySlider
}

export { initialiseSlider }
