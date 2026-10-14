// Shared mock - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instance survives the jest.resetModules() calls used to reload search.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map/plugins/search', () => mockInteractiveMapMocks.searchPlugin)
const mockCreateSearchPlugin = mockInteractiveMapMocks.searchPlugin.default

jest.mock('../../mapConfig.js', () => ({
  getDefraMapConfig: jest.fn(() => Promise.resolve({ fmpProxyUrl: 'http://localhost:3005' }))
}))

const buildInteractiveMap = () => {
  const handlers = {}
  return {
    on: jest.fn((event, handler) => { handlers[event] = handler }),
    trigger: (event, ...args) => handlers[event](...args),
    addMarker: jest.fn()
  }
}

const loadSearchPlugin = async () => {
  jest.resetModules()
  const { getDefraMapConfig } = require('../../mapConfig.js')
  getDefraMapConfig.mockReturnValue(Promise.resolve({ fmpProxyUrl: 'http://localhost:3005' }))
  mockCreateSearchPlugin.mockReturnValue({})
  const { initialiseSearchPlugin } = require('./search.js')
  return await initialiseSearchPlugin()
}

describe('searchPlugin', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should build the plugin with the OS names search, transformRequest and england region', async () => {
    await loadSearchPlugin()

    expect(mockCreateSearchPlugin).toHaveBeenCalledWith(expect.objectContaining({
      placeholder: 'Search for a place in England',
      regions: ['england'],
      width: '300px',
      showMarker: false
    }))
    const config = mockCreateSearchPlugin.mock.calls[0][0]
    expect(config.osNamesURL).toContain('place-lookup')
  })

  it('should add a single search button', async () => {
    await loadSearchPlugin()

    const config = mockCreateSearchPlugin.mock.calls[0][0]
    expect(config.manifest.buttons).toEqual([expect.objectContaining({ id: 'search' })])
  })

  describe('hideButton / showButton', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="map-search"></div>'
    })

    it('should hide the search button', async () => {
      const searchPlugin = await loadSearchPlugin()

      searchPlugin.hideButton()

      expect(document.getElementById('map-search').style.display).toBe('none')
    })

    it('should show the search button', async () => {
      const searchPlugin = await loadSearchPlugin()

      searchPlugin.showButton()

      expect(document.getElementById('map-search').style.display).toBe('flex')
    })

    it('should not throw when the button is not present', async () => {
      document.body.innerHTML = ''
      const searchPlugin = await loadSearchPlugin()

      expect(() => searchPlugin.hideButton()).not.toThrow()
      expect(() => searchPlugin.showButton()).not.toThrow()
    })
  })

  describe('onOpen / onClosed', () => {
    it('should hide the info panel marker when search opens', async () => {
      const searchPlugin = await loadSearchPlugin()
      searchPlugin.plugins = { interact: { hideInfoPanelMarker: jest.fn(), hideInfoPanel: jest.fn() } }

      searchPlugin.onOpen()

      expect(searchPlugin.plugins.interact.hideInfoPanelMarker).toHaveBeenCalled()
    })

    it('should hide the info panel when search closes', async () => {
      const searchPlugin = await loadSearchPlugin()
      searchPlugin.plugins = { interact: { hideInfoPanelMarker: jest.fn(), hideInfoPanel: jest.fn() } }

      searchPlugin.onClosed()

      expect(searchPlugin.plugins.interact.hideInfoPanel).toHaveBeenCalled()
    })

    it('should not throw when there are no plugins attached yet', async () => {
      const searchPlugin = await loadSearchPlugin()

      expect(() => searchPlugin.onOpen()).not.toThrow()
      expect(() => searchPlugin.onClosed()).not.toThrow()
    })
  })

  describe('attach', () => {
    it('should register handlers for search:open, search:close and search:match', async () => {
      const searchPlugin = await loadSearchPlugin()
      const interactiveMap = buildInteractiveMap()

      searchPlugin.attach(interactiveMap)

      expect(interactiveMap.on).toHaveBeenCalledWith('search:open', searchPlugin.onOpen)
      expect(interactiveMap.on).toHaveBeenCalledWith('search:close', searchPlugin.onClosed)
      expect(interactiveMap.on).toHaveBeenCalledWith('search:match', expect.any(Function))
    })

    it('should add a labelled marker styled with the literal search pin colours on search:match', async () => {
      const searchPlugin = await loadSearchPlugin()
      const interactiveMap = buildInteractiveMap()
      searchPlugin.attach(interactiveMap)

      interactiveMap.trigger('search:match', { point: [1, 2], text: 'Bristol' })

      expect(interactiveMap.addMarker).toHaveBeenCalledWith('search', [1, 2], {
        label: 'Bristol',
        showLabel: true,
        backgroundColor: { outdoor: '#ca3535', dark: '#ffffff' },
        foregroundColor: { outdoor: '#ffffff', dark: '#ca3535' }
      })
    })
  })
})
