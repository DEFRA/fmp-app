const mockScaleBarInstance = { name: 'scaleBar' }
const mockScaleBarPlugin = jest.fn()
jest.mock('./scale-bar/scale-bar.js', () => ({
  scaleBarPlugin: (...args) => mockScaleBarPlugin(...args)
}))

const mockSearchPluginInstance = { name: 'search' }
jest.mock('./search/search.js', () => ({
  searchPlugin: mockSearchPluginInstance
}))

const mockMapKeyPluginInstance = { name: 'mapKey' }
jest.mock('./map-key/map-key.js', () => ({
  mapKeyPlugin: mockMapKeyPluginInstance
}))

const mockMenuPluginInstance = { name: 'menu' }
jest.mock('./menu/menu.js', () => ({
  menuPlugin: mockMenuPluginInstance
}))

const mockInteractPluginInstance = { name: 'interact' }
jest.mock('./interact/interact.js', () => ({
  interactPlugin: mockInteractPluginInstance
}))

const mockMapStyleInstance = { name: 'mapStyle' }
const mockMapStylePlugin = jest.fn()
jest.mock('./map-styles/map-styles.js', () => ({
  mapStylePlugin: (...args) => mockMapStylePlugin(...args)
}))

const mockDatasetsInstance = { name: 'datasets' }
const mockInitialiseDatasetsPlugin = jest.fn()
jest.mock('./datasets/datasetsPlugin.js', () => ({
  initialiseDatasetsPlugin: (...args) => mockInitialiseDatasetsPlugin(...args)
}))

const mockOpacitySliderInstance = { name: 'opacitySlider' }
const mockOpacitySliderPlugin = jest.fn()
jest.mock('./opacity-slider/opacity-slider.js', () => ({
  opacitySliderPlugin: (...args) => mockOpacitySliderPlugin(...args)
}))

const mockDrawPluginInstance = { name: 'draw' }
const mockFramePluginInstance = { name: 'frame' }
jest.mock('./draw/drawPlugin.js', () => ({
  drawPlugin: mockDrawPluginInstance,
  framePlugin: mockFramePluginInstance
}))

const loadInitialisePlugins = () => {
  jest.resetModules()
  return require('./initialisePlugins.js')
}

describe('initialisePlugins', () => {
  const defraMapConfig = { OS_ACCOUNT_NUMBER: 'AC0000807064' }

  beforeEach(() => {
    mockScaleBarPlugin.mockReturnValue(mockScaleBarInstance)
    mockMapStylePlugin.mockReturnValue(mockMapStyleInstance)
    mockInitialiseDatasetsPlugin.mockReturnValue(mockDatasetsInstance)
    mockOpacitySliderPlugin.mockReturnValue(mockOpacitySliderInstance)
  })

  it('should build the datasets plugin from the defra map config', () => {
    const { initialisePlugins } = loadInitialisePlugins()

    initialisePlugins(defraMapConfig)

    expect(mockInitialiseDatasetsPlugin).toHaveBeenCalledWith(defraMapConfig)
  })

  it('should build the opacity slider plugin wired to the datasets plugin', () => {
    const { initialisePlugins } = loadInitialisePlugins()

    initialisePlugins(defraMapConfig)

    expect(mockOpacitySliderPlugin).toHaveBeenCalledWith(mockDatasetsInstance)
  })

  it('should build the map style plugin from the OS account number', () => {
    const { initialisePlugins } = loadInitialisePlugins()

    initialisePlugins(defraMapConfig)

    expect(mockMapStylePlugin).toHaveBeenCalledWith(defraMapConfig.OS_ACCOUNT_NUMBER)
  })

  it('should build the scale bar plugin with no arguments', () => {
    const { initialisePlugins } = loadInitialisePlugins()

    initialisePlugins(defraMapConfig)

    expect(mockScaleBarPlugin).toHaveBeenCalledWith()
  })

  it('should return every plugin in a single array', () => {
    const { initialisePlugins } = loadInitialisePlugins()

    const pluginArray = initialisePlugins(defraMapConfig)

    expect(pluginArray).toEqual([
      mockDatasetsInstance,
      mockOpacitySliderInstance,
      mockMapKeyPluginInstance,
      mockMenuPluginInstance,
      mockMapStyleInstance,
      mockScaleBarInstance,
      mockSearchPluginInstance,
      mockDrawPluginInstance,
      mockFramePluginInstance,
      mockInteractPluginInstance
    ])
  })

  it('should give every plugin a reference to the full set of named plugins', () => {
    const { initialisePlugins } = loadInitialisePlugins()

    const pluginArray = initialisePlugins(defraMapConfig)

    pluginArray.forEach((plugin) => {
      expect(plugin.plugins).toEqual(expect.objectContaining({
        datasets: mockDatasetsInstance,
        opacitySlider: mockOpacitySliderInstance,
        mapKey: mockMapKeyPluginInstance,
        menu: mockMenuPluginInstance,
        mapStyle: mockMapStyleInstance,
        scaleBar: mockScaleBarInstance,
        search: mockSearchPluginInstance,
        draw: mockDrawPluginInstance,
        frame: mockFramePluginInstance,
        interact: mockInteractPluginInstance
      }))
    })
  })

  describe('attachInteractiveMapToPlugins', () => {
    it('should give every plugin a reference to the interactive map', () => {
      const { initialisePlugins, attachInteractiveMapToPlugins } = loadInitialisePlugins()
      const pluginArray = initialisePlugins(defraMapConfig)
      const interactiveMap = { name: 'interactiveMap' }

      attachInteractiveMapToPlugins(interactiveMap)

      pluginArray.forEach((plugin) => {
        expect(plugin.interactiveMap).toBe(interactiveMap)
      })
    })

    it("should call each plugin's attach method, if it has one, with the interactive map", () => {
      const { initialisePlugins, attachInteractiveMapToPlugins } = loadInitialisePlugins()
      mockDatasetsInstance.attach = jest.fn()
      initialisePlugins(defraMapConfig)
      const interactiveMap = { name: 'interactiveMap' }

      attachInteractiveMapToPlugins(interactiveMap)

      expect(mockDatasetsInstance.attach).toHaveBeenCalledWith(interactiveMap)
      delete mockDatasetsInstance.attach
    })

    it('should not throw for plugins without an attach method', () => {
      const { initialisePlugins, attachInteractiveMapToPlugins } = loadInitialisePlugins()
      initialisePlugins(defraMapConfig)
      const interactiveMap = { name: 'interactiveMap' }

      expect(() => attachInteractiveMapToPlugins(interactiveMap)).not.toThrow()
    })
  })
})
