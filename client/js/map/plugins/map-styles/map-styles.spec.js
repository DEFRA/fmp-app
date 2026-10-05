// Shared mock - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instance survives the jest.resetModules() calls used to reload map-styles.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map/plugins/map-styles', () => mockInteractiveMapMocks.mapStylesPlugin)
const mockCreateMapStylesPlugin = mockInteractiveMapMocks.mapStylesPlugin.default

const loadMapStylesPlugin = () => {
  jest.resetModules()
  mockCreateMapStylesPlugin.mockReturnValue({ pluginInstance: true })
  return require('./map-styles.js').mapStylePlugin
}

describe('mapStylePlugin', () => {
  const osAccountNumber = 'AC0000807064'
  const currentYear = new Date().getFullYear()

  it('should return the plugin instance built by createMapStylesPlugin', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    const result = mapStylePlugin(osAccountNumber)

    expect(result).toEqual({ pluginInstance: true })
  })

  it('should build 3 map styles: outdoor, dark and black-and-white', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    mapStylePlugin(osAccountNumber)

    const { mapStyles } = mockCreateMapStylesPlugin.mock.calls[0][0]
    expect(mapStyles.map((s) => s.id)).toEqual(['outdoor', 'dark', 'black-and-white'])
  })

  it('should label the styles Outdoor, Dark and Black and white', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    mapStylePlugin(osAccountNumber)

    const { mapStyles } = mockCreateMapStylesPlugin.mock.calls[0][0]
    expect(mapStyles.map((s) => s.label)).toEqual(['Outdoor', 'Dark', 'Black and white'])
  })

  it('should include the OS account number and current year in the attribution notice for every style', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    mapStylePlugin(osAccountNumber)

    const { mapStyles } = mockCreateMapStylesPlugin.mock.calls[0][0]
    const expectedAttribution = `<a href="/os-terms" class="os-credits__link">&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber}</a>`
    mapStyles.forEach((style) => {
      expect(style.attribution).toBe(expectedAttribution)
    })
  })

  it('should use the white logo for the dark style and the standard logo for the other styles', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    mapStylePlugin(osAccountNumber)

    const { mapStyles } = mockCreateMapStylesPlugin.mock.calls[0][0]
    const [outdoor, dark, blackAndWhite] = mapStyles
    expect(outdoor.logo).toBe('/assets/images/os-logo.svg')
    expect(dark.logo).toBe('/assets/images/os-logo-white.svg')
    expect(blackAndWhite.logo).toBe('/assets/images/os-logo.svg')
  })

  it('should set the dark style colour schemes to dark', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    mapStylePlugin(osAccountNumber)

    const { mapStyles } = mockCreateMapStylesPlugin.mock.calls[0][0]
    const dark = mapStyles.find((s) => s.id === 'dark')
    expect(dark.mapColorScheme).toBe('dark')
    expect(dark.appColorScheme).toBe('dark')
  })

  it('should link each style url to its master-map route', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    mapStylePlugin(osAccountNumber)

    const { mapStyles } = mockCreateMapStylesPlugin.mock.calls[0][0]
    expect(mapStyles.map((s) => s.url)).toEqual([
      '/map/styles/master-map',
      '/map/styles/master-map-dark',
      '/map/styles/black-and-white-map'
    ])
  })

  it('should add a mapStyles button and panel slotted to the map-styles-button', () => {
    const mapStylePlugin = loadMapStylesPlugin()

    mapStylePlugin(osAccountNumber)

    const { manifest } = mockCreateMapStylesPlugin.mock.calls[0][0]
    expect(manifest.buttons[0].id).toBe('mapStyles')
    expect(manifest.panels[0].id).toBe('mapStyles')
    expect(manifest.panels[0].desktop.slot).toBe('map-styles-button')
    expect(manifest.panels[0].tablet.slot).toBe('map-styles-button')
    expect(manifest.panels[0].mobile.slot).toBe('drawer')
  })
})
