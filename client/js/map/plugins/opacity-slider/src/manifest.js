// /plugins/flood-menu/manifest.js
import { initialState, actions } from './reducer.js'
import { OpacitySliderInit } from './OpacitySliderInit.jsx'
import { OpacitySlider } from './components/OpacitySlider.jsx'

// Targets the `<panelId>-panel` slot convention (mapControls.js) rather than
// a layout slot — `order: 1` splices this control in ahead of the host
// panel's own content (which always renders at order 0, see mapPanels.js).
const controlSlots = {
  mobile: { slot: 'menu-panel', order: 1 },
  tablet: { slot: 'menu-panel', order: 1 },
  desktop: { slot: 'menu-panel', order: 10 }
}

export const manifest = {
  reducer: {
    initialState,
    actions
  },

  InitComponent: OpacitySliderInit,

  controls: [{
    id: 'drawMenu',
    label: 'Draw menu',
    ...controlSlots,
    render: OpacitySlider
  }]
}
