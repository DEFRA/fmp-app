const mockCreateOpacitySliderPlugin = jest.fn()
jest.mock('./src/index.js', () => ({
  __esModule: true,
  default: (...args) => mockCreateOpacitySliderPlugin(...args)
}))

const { opacitySliderPlugin } = require('./opacity-slider.js')

describe('opacitySliderPlugin', () => {
  it('should build the plugin with the "Layer opacity" heading', () => {
    const datasetsPlugin = { setOpacity: jest.fn() }

    opacitySliderPlugin(datasetsPlugin)

    expect(mockCreateOpacitySliderPlugin).toHaveBeenCalledWith(expect.objectContaining({ heading: 'Layer opacity' }))
  })

  it('should forward opacity changes to the datasets plugin', () => {
    const datasetsPlugin = { setOpacity: jest.fn() }

    opacitySliderPlugin(datasetsPlugin)
    const { onChange } = mockCreateOpacitySliderPlugin.mock.calls[0][0]
    onChange(0.5)

    expect(datasetsPlugin.setOpacity).toHaveBeenCalledWith(0.5)
  })
})
