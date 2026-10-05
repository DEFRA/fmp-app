global.IS_REACT_ACT_ENVIRONMENT = true
const React = require('react')
const { act } = require('react')
const { createRoot } = require('react-dom/client')
const { OpacitySlider } = require('./OpacitySlider.jsx')

// jsdom does not implement SVG geometry APIs used by the vendored slider widget
beforeAll(() => {
  window.SVGSVGElement.prototype.createSVGPoint = function () {
    return {
      x: 0,
      y: 0,
      matrixTransform () {
        return { x: this.x, y: this.y }
      }
    }
  }
  window.SVGSVGElement.prototype.getScreenCTM = () => ({ inverse: () => ({}) })
  window.SVGElement.prototype.getBBox = () => ({ width: 20 })
})

// Slider attaches by document.getElementById('opacity-control'), which is not
// scoped to a container, so only one instance may exist in the document at a time
afterEach(() => {
  document.body.innerHTML = ''
})

const renderSlider = (props) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(React.createElement(OpacitySlider, props))
  })
  return { container }
}

const buildProps = ({ value = 0.75, dispatch = jest.fn(), heading } = {}) => ({
  pluginState: { dispatch, value },
  pluginConfig: heading ? { heading } : {}
})

describe('OpacitySlider', () => {
  it('should render the default "Layer opacity" heading', () => {
    const { container } = renderSlider(buildProps())

    expect(container.querySelector('#im-c-slider__heading').textContent).toBe('Layer opacity')
  })

  it('should render a custom heading from pluginConfig', () => {
    const { container } = renderSlider(buildProps({ heading: 'Custom heading' }))

    expect(container.querySelector('#im-c-slider__heading').textContent).toBe('Custom heading')
  })

  it('should attach the slider widget and reflect the initial opacity as a percentage', () => {
    const { container } = renderSlider(buildProps({ value: 0.6 }))

    const sliderNode = container.querySelector('.opacity-slider')
    expect(sliderNode.getAttribute('aria-valuenow')).toBe('60')
  })

  it('should display the current opacity as a percentage in the value text element once attached', () => {
    const { container } = renderSlider(buildProps({ value: 0.6 }))

    expect(container.querySelector('svg text.value').textContent).toBe('60')
  })

  it('should dispatch SET_VALUE with the new opacity as a decimal when the rail is clicked', () => {
    const dispatch = jest.fn()
    const { container } = renderSlider(buildProps({ value: 0, dispatch }))

    const rail = container.querySelector('.rail')
    act(() => {
      rail.dispatchEvent(new window.MouseEvent('click', { bubbles: true, clientX: 15 + 112.5, clientY: 0 }))
    })

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_VALUE', payload: 0.5 })
  })
})
