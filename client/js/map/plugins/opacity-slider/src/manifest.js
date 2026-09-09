import { initialState, actions } from './reducer.js'
import { OpacitySlider } from './components/OpacitySlider.jsx'

// Targets the `<panelId>-panel` slot convention (mapControls.js) rather than
// a layout slot — `order: 1` splices this control in ahead of the host
// panel's own content (which always renders at order 0, see mapPanels.js).
const slot = 'menu-panel'
const controlSlots = {
  mobile: { slot, order: 10 },
  tablet: { slot, order: 10 },
  desktop: { slot, order: 10 }
}

export const manifest = {
  reducer: {
    initialState,
    actions
  },

  controls: [{
    id: 'drawMenu',
    label: 'Draw menu',
    ...controlSlots,
    render: OpacitySlider
  }]
}
