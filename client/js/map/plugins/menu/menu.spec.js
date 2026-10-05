// Shared mock - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instance survives the jest.resetModules() calls used to reload menu.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
// virtual mock: this subpath has no CJS "require" export condition in the package
jest.mock('@defra/interactive-map/plugins/menu', () => mockInteractiveMapMocks.menuPlugin, { virtual: true })
const mockCreateMenuPlugin = mockInteractiveMapMocks.menuPlugin.default

describe('menuPlugin', () => {
  beforeEach(() => {
    jest.resetModules()
    mockCreateMenuPlugin.mockReturnValue({ pluginInstance: true })
  })

  it('should build the plugin from the menuConfig definitions', () => {
    const { menuConfig } = require('./menuConfig.js')

    require('./menu.js')

    expect(mockCreateMenuPlugin).toHaveBeenCalledWith(expect.objectContaining({ menu: menuConfig }))
  })

  it('should add a single menu panel/button pair', () => {
    require('./menu.js')

    const { manifest } = mockCreateMenuPlugin.mock.calls[0][0]
    expect(manifest.panels[0].id).toBe('menu')
    expect(manifest.buttons[0].id).toBe('menuButton')
  })

  it('should keep the menu panel open by default on desktop but closed on tablet', () => {
    require('./menu.js')

    const { manifest } = mockCreateMenuPlugin.mock.calls[0][0]
    expect(manifest.panels[0].desktop.open).toBe(true)
    expect(manifest.panels[0].tablet.open).toBe(false)
  })

  it('should return the plugin instance built by createMenuPlugin', () => {
    const { menuPlugin } = require('./menu.js')

    expect(menuPlugin).toEqual({ pluginInstance: true })
  })
})
