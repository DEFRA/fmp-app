import { OpacitySlider } from './slider.js'
export { sliderMarkUp } from './slider.html.js'

const initialiseSlider = (interactiveMap) => {
  const opacitySlider = new OpacitySlider('opacity-control')
  interactiveMap.on('app:panelopened', ({ panelId }) => {
    if (panelId === 'menu') {
      opacitySlider.checkAndAttach()
    }
  })
}

export { initialiseSlider }
