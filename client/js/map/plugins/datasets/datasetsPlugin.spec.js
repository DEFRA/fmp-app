const mockReactiveUtilsWhen = jest.fn()
jest.mock('@arcgis/core/core/reactiveUtils', () => ({
  when: (...args) => mockReactiveUtilsWhen(...args)
}))

const mockCreateDatasetsPluginInstance = {}
const mockCreateDatasetsPlugin = jest.fn()
// virtual mock: this subpath has no CJS "require" export condition in the package
jest.mock('@defra/interactive-map/plugins/datasets', () => ({
  __esModule: true,
  default: (...args) => mockCreateDatasetsPlugin(...args)
}), { virtual: true })

const mockSurfaceWaterExtentsKey = { id: 'surfacewater-extents-key' }
const mockSurfaceWaterDatasets = jest.fn()
jest.mock('./surfaceWater.js', () => ({
  surfaceWaterExtentsKey: mockSurfaceWaterExtentsKey,
  surfaceWaterDatasets: (...args) => mockSurfaceWaterDatasets(...args)
}))

const mockFloodZonesDatasets = jest.fn()
jest.mock('./floodZones.js', () => ({
  floodZonesDatasets: (...args) => mockFloodZonesDatasets(...args)
}))

const mockFeatureLayers = jest.fn()
jest.mock('./featureLayers.js', () => ({
  featureLayers: (...args) => mockFeatureLayers(...args)
}))

const mockMapState = {
  styleToValuesMap: null,
  updateVisibleLayers: jest.fn(),
  initPointerMove: jest.fn(),
  interfaceType: null,
  view: { updating: false }
}
jest.mock('../../interactive-map-helpers/mapState.js', () => ({
  mapState: mockMapState
}))

const loadDatasetsPlugin = () => {
  jest.resetModules()
  return require('./datasetsPlugin.js').initialiseDatasetsPlugin
}

describe('initialiseDatasetsPlugin', () => {
  const config = { agolServiceUrl: 'https://example.com/services', agolVectorTileUrl: 'https://example.com/vt', layerNameSuffix: '_NON_PRODUCTION' }

  beforeEach(() => {
    mockCreateDatasetsPlugin.mockReturnValue({ ...mockCreateDatasetsPluginInstance })
    mockFloodZonesDatasets.mockReturnValue([{ id: 'floodzones' }])
    mockSurfaceWaterDatasets.mockReturnValue([{ id: 'surfacewater' }])
    mockFeatureLayers.mockReturnValue([{ id: 'mainrivers' }])
    mockMapState.interfaceType = null
    mockMapState.view = { updating: false }
  })

  it('should build datasets from flood zones, surface water and feature layers', () => {
    const initialiseDatasetsPlugin = loadDatasetsPlugin()

    initialiseDatasetsPlugin(config)

    expect(mockFloodZonesDatasets).toHaveBeenCalledWith({ agolVectorTileUrl: config.agolVectorTileUrl, layerNameSuffix: config.layerNameSuffix })
    expect(mockSurfaceWaterDatasets).toHaveBeenCalledWith({ agolVectorTileUrl: config.agolVectorTileUrl, layerNameSuffix: config.layerNameSuffix })
    expect(mockFeatureLayers).toHaveBeenCalledWith(config.agolServiceUrl, config.layerNameSuffix)

    const [{ datasets }] = mockCreateDatasetsPlugin.mock.calls[0]
    expect(datasets).toEqual([
      { id: 'floodzones' },
      mockSurfaceWaterExtentsKey,
      { id: 'surfacewater' },
      { id: 'mainrivers' }
    ])
  })

  it('should create the plugin with the expected default configuration', () => {
    const initialiseDatasetsPlugin = loadDatasetsPlugin()

    initialiseDatasetsPlugin(config)

    expect(mockCreateDatasetsPlugin).toHaveBeenCalledWith(expect.objectContaining({
      globals: { opacityMode: 'global', opacity: 0.75, visible: true },
      hasMenu: false
    }))
  })

  it('should start with ready set to false', () => {
    const initialiseDatasetsPlugin = loadDatasetsPlugin()

    const plugin = initialiseDatasetsPlugin(config)

    expect(plugin.ready).toBe(false)
  })

  it('should map esriStyleLayerId to infoPanelData for every sublayer that has it', () => {
    mockFloodZonesDatasets.mockReturnValue([{
      id: 'floodzones',
      sublayers: [
        { esriStyleLayerId: 'layer-1', infoPanelData: { ds: 'fz' } },
        { esriStyleLayerId: 'layer-2' } // no infoPanelData, should be skipped
      ]
    }])
    const initialiseDatasetsPlugin = loadDatasetsPlugin()

    initialiseDatasetsPlugin(config)

    expect(mockMapState.styleToValuesMap).toEqual({ 'layer-1': { ds: 'fz' } })
  })

  it('should not fail building the style map for datasets without sublayers', () => {
    const initialiseDatasetsPlugin = loadDatasetsPlugin()

    initialiseDatasetsPlugin(config)

    expect(mockMapState.styleToValuesMap).toEqual({})
  })

  describe('attach', () => {
    it('should store the interactive map and listen for datasets:ready', () => {
      const initialiseDatasetsPlugin = loadDatasetsPlugin()
      const plugin = initialiseDatasetsPlugin(config)
      const interactiveMap = { on: jest.fn() }

      plugin.attach(interactiveMap)

      expect(plugin.interactiveMap).toBe(interactiveMap)
      expect(interactiveMap.on).toHaveBeenCalledWith('datasets:ready', expect.any(Function))
    })

    it('should mark the plugin ready and update visible layers/pointer move once datasets are ready', () => {
      const initialiseDatasetsPlugin = loadDatasetsPlugin()
      const plugin = initialiseDatasetsPlugin(config)
      const interactiveMap = { on: jest.fn() }
      plugin.attach(interactiveMap)

      const onDatasetsReady = interactiveMap.on.mock.calls.find(([name]) => name === 'datasets:ready')[1]
      onDatasetsReady()

      expect(plugin.ready).toBe(true)
      expect(mockMapState.updateVisibleLayers).toHaveBeenCalled()
      expect(mockMapState.initPointerMove).toHaveBeenCalled()
      expect(mockReactiveUtilsWhen).toHaveBeenCalledWith(expect.any(Function), expect.any(Function))
    })

    it('should trigger a hit test on touch devices once the view stops updating', () => {
      const initialiseDatasetsPlugin = loadDatasetsPlugin()
      const plugin = initialiseDatasetsPlugin(config)
      plugin.plugins = { interact: { triggerHitTest: jest.fn() } }
      const interactiveMap = { on: jest.fn() }
      plugin.attach(interactiveMap)
      const onDatasetsReady = interactiveMap.on.mock.calls.find(([name]) => name === 'datasets:ready')[1]
      onDatasetsReady()

      const [conditionFn, callbackFn] = mockReactiveUtilsWhen.mock.calls[0]
      mockMapState.interfaceType = 'touch'
      expect(conditionFn()).toBe(true)
      callbackFn()

      expect(plugin.plugins.interact.triggerHitTest).toHaveBeenCalled()
    })

    it('should not trigger a hit test for non-touch devices', () => {
      const initialiseDatasetsPlugin = loadDatasetsPlugin()
      const plugin = initialiseDatasetsPlugin(config)
      plugin.plugins = { interact: { triggerHitTest: jest.fn() } }
      const interactiveMap = { on: jest.fn() }
      plugin.attach(interactiveMap)
      const onDatasetsReady = interactiveMap.on.mock.calls.find(([name]) => name === 'datasets:ready')[1]
      onDatasetsReady()

      const [, callbackFn] = mockReactiveUtilsWhen.mock.calls[0]
      mockMapState.interfaceType = 'mouse'
      callbackFn()

      expect(plugin.plugins.interact.triggerHitTest).not.toHaveBeenCalled()
    })

    it('should evaluate the reactiveUtils condition against the view updating state', () => {
      const initialiseDatasetsPlugin = loadDatasetsPlugin()
      const plugin = initialiseDatasetsPlugin(config)
      const interactiveMap = { on: jest.fn() }
      plugin.attach(interactiveMap)
      const onDatasetsReady = interactiveMap.on.mock.calls.find(([name]) => name === 'datasets:ready')[1]
      onDatasetsReady()

      const [conditionFn] = mockReactiveUtilsWhen.mock.calls[0]
      mockMapState.view.updating = true
      expect(conditionFn()).toBe(false)
      mockMapState.view.updating = false
      expect(conditionFn()).toBe(true)
    })
  })
})
