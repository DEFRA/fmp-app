const { manifest } = require('./manifest.js')
const { initialState, actions } = require('./reducer.js')
const { OpacitySlider } = require('./components/OpacitySlider.jsx')
const { OpacitySliderInit } = require('./OpacitySliderInit.jsx')

describe('manifest', () => {
  it('should wire up the reducer initial state and actions', () => {
    expect(manifest.reducer.initialState).toBe(initialState)
    expect(manifest.reducer.actions).toBe(actions)
  })

  it('should use OpacitySliderInit as the plugin init component', () => {
    expect(manifest.InitComponent).toBe(OpacitySliderInit)
  })

  it('should render a single "slider" control using the OpacitySlider component', () => {
    expect(manifest.controls).toHaveLength(1)
    const [slider] = manifest.controls
    expect(slider.id).toBe('slider')
    expect(slider.render).toBe(OpacitySlider)
  })

  it('should slot the slider control into the menu-panel at order 10 on every breakpoint', () => {
    const [slider] = manifest.controls

    expect(slider.mobile).toEqual({ slot: 'menu-panel', order: 10 })
    expect(slider.tablet).toEqual({ slot: 'menu-panel', order: 10 })
    expect(slider.desktop).toEqual({ slot: 'menu-panel', order: 10 })
  })
})
