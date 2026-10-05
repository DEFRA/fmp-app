// virtual mock: jest has no transform for .scss files
jest.mock('./opacity-slider.scss', () => ({}), { virtual: true })

const { manifest } = require('./manifest.js')
const createPlugin = require('./index.js').default

describe('createPlugin', () => {
  it('should identify itself as the opacity-slider plugin', () => {
    const plugin = createPlugin()

    expect(plugin.id).toBe('opacity-slider')
  })

  it('should spread any given options onto the plugin', () => {
    const plugin = createPlugin({ heading: 'Layer opacity', onChange: jest.fn() })

    expect(plugin.heading).toBe('Layer opacity')
    expect(typeof plugin.onChange).toBe('function')
  })

  it('should default to no options when none are given', () => {
    const plugin = createPlugin()

    expect(plugin).toEqual({ id: 'opacity-slider', load: expect.any(Function) })
  })

  it('should load the manifest module', async () => {
    const plugin = createPlugin()

    const loaded = await plugin.load()

    expect(loaded).toBe(manifest)
  })
})
