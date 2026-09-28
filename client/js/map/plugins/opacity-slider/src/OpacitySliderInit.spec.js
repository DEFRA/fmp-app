global.IS_REACT_ACT_ENVIRONMENT = true
const React = require('react')
const { act } = require('react')
const { createRoot } = require('react-dom/client')
const { OpacitySliderInit } = require('./OpacitySliderInit.jsx')

const renderInit = (props) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(React.createElement(OpacitySliderInit, props))
  })
  return {
    rerender: (newProps) => act(() => root.render(React.createElement(OpacitySliderInit, newProps))),
    unmount: () => act(() => root.unmount())
  }
}

const buildProps = ({ ready = false, value = 0.75, dispatch = jest.fn(), onChange = jest.fn(), eventBus } = {}) => ({
  pluginConfig: { onChange },
  pluginState: { dispatch, ready, value },
  services: { eventBus: eventBus || { on: jest.fn(), off: jest.fn() } }
})

describe('OpacitySliderInit', () => {
  it('should subscribe to datasets:ready on mount', () => {
    const eventBus = { on: jest.fn(), off: jest.fn() }

    renderInit(buildProps({ eventBus }))

    expect(eventBus.on).toHaveBeenCalledWith('datasets:ready', expect.any(Function))
  })

  it('should dispatch SET_READY when datasets:ready fires', () => {
    const eventBus = { on: jest.fn(), off: jest.fn() }
    const dispatch = jest.fn()

    renderInit(buildProps({ eventBus, dispatch }))
    const [, onDatasetsReady] = eventBus.on.mock.calls[0]
    onDatasetsReady()

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_READY' })
  })

  it('should unsubscribe from datasets:ready on unmount', () => {
    const eventBus = { on: jest.fn(), off: jest.fn() }

    const { unmount } = renderInit(buildProps({ eventBus }))
    const [, onDatasetsReady] = eventBus.on.mock.calls[0]

    unmount()

    expect(eventBus.off).toHaveBeenCalledWith('datasets:ready', onDatasetsReady)
  })

  it('should not call onChange while not ready', () => {
    const onChange = jest.fn()

    renderInit(buildProps({ ready: false, value: 0.5, onChange }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should call onChange with the current value once ready', () => {
    const onChange = jest.fn()

    const { rerender } = renderInit(buildProps({ ready: false, value: 0.5, onChange }))
    rerender(buildProps({ ready: true, value: 0.5, onChange }))

    expect(onChange).toHaveBeenCalledWith(0.5)
  })

  it('should call onChange again when the value changes while ready', () => {
    const onChange = jest.fn()

    const { rerender } = renderInit(buildProps({ ready: true, value: 0.5, onChange }))
    onChange.mockClear()
    rerender(buildProps({ ready: true, value: 0.8, onChange }))

    expect(onChange).toHaveBeenCalledWith(0.8)
  })
})
