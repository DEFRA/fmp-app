import { initialState, actions } from './reducer.js'
import { OpacitySlider } from './components/OpacitySlider.jsx'
import { OpacitySliderInit } from './OpacitySliderInit.jsx'
// Targets the `<panelId>-panel` slot convention (mapControls.js) rather than
// a layout slot — `order: 1` splices this control in ahead of the host
// panel's own content (which always renders at order 0, see mapPanels.js).
const slot = 'menu-panel'
const order = 10
const controlSlots = {
  mobile: { slot, order },
  tablet: { slot, order },
  desktop: { slot, order }
}

export const manifest = {
  reducer: {
    initialState,
    actions
  },

  InitComponent: OpacitySliderInit,

  controls: [{
    id: 'slider',
    ...controlSlots,
    render: OpacitySlider
  }]
}
