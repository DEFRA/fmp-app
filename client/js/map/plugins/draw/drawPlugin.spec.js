// Shared mocks - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instances survive the jest.resetModules() calls used to reload drawPlugin.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map/plugins/frame', () => mockInteractiveMapMocks.framePlugin)
// virtual mock: this subpath has no CJS "require" export condition in the package
jest.mock('@defra/interactive-map/plugins/draw-es', () => mockInteractiveMapMocks.drawEsPlugin, { virtual: true })

const mockCreateDrawPlugin = mockInteractiveMapMocks.drawEsPlugin.default
const mockCreateFramePlugin = mockInteractiveMapMocks.framePlugin.default

const mockDrawPluginInstance = {}
const mockFramePluginInstance = {}

const mockSiteBoundary = {
  id: 'boundary',
  isSquare: false,
  isEmpty: true,
  isEditing: false,
  isComplete: false,
  feature: null,
  encodedPolygon: null,
  mapView: null,
  state: null,
  type: null
}
class MockSiteBoundary {}
MockSiteBoundary.EMPTY = 'empty'
MockSiteBoundary.EDITING = 'editing'
MockSiteBoundary.COMPLETE = 'complete'
MockSiteBoundary.POLYGON = 'polygon'
MockSiteBoundary.SQUARE = 'square'
jest.mock('../../interactive-map-helpers/siteBoundary.js', () => ({
  siteBoundary: mockSiteBoundary,
  SiteBoundary: MockSiteBoundary
}))

const mockDimensionsPanelInstance = {
  showPanel: jest.fn(),
  hidePanel: jest.fn(),
  hideWarning: jest.fn(),
  setFeatureValues: jest.fn()
}
const mockDimensionsPanelConstructor = jest.fn()
jest.mock('./dimensionsPanel.js', () => ({
  DimensionsPanel: mockDimensionsPanelConstructor,
  DIMENSIONS_PANEL_ID: 'dimensions-panel'
}))

const mockMapState = { breakpoint: 'desktop' }
jest.mock('../../interactive-map-helpers/mapState.js', () => ({
  mapState: mockMapState
}))

const buildInteractiveMap = () => {
  const handlers = {}
  return {
    on: jest.fn((event, handler) => { handlers[event] = handler }),
    trigger: (event, ...args) => handlers[event](...args),
    addButton: jest.fn(),
    toggleButtonState: jest.fn(),
    addPanel: jest.fn(),
    removePanel: jest.fn(),
    showPanel: jest.fn(),
    hidePanel: jest.fn(),
    removeMarker: jest.fn()
  }
}

const loadDrawPlugin = () => {
  jest.resetModules()
  mockCreateDrawPlugin.mockReturnValue(mockDrawPluginInstance)
  mockCreateFramePlugin.mockReturnValue(mockFramePluginInstance)
  return require('./drawPlugin.js')
}

describe('drawPlugin / framePlugin', () => {
  beforeEach(() => {
    Object.assign(mockSiteBoundary, {
      id: 'boundary',
      isSquare: false,
      isEmpty: true,
      isEditing: false,
      isComplete: false,
      feature: null,
      encodedPolygon: null,
      mapView: null,
      state: null,
      type: null
    })
    mockDimensionsPanelConstructor.mockImplementation(function () {
      return mockDimensionsPanelInstance
    })
    document.body.innerHTML = '<div id="map"></div>'
  })

  it('should build the draw and frame plugins from the draw-es and frame factories', () => {
    loadDrawPlugin()

    expect(mockCreateDrawPlugin).toHaveBeenCalledWith()
    expect(mockCreateFramePlugin).toHaveBeenCalledWith()
  })

  describe('toggleKeyWhenEditing', () => {
    it('should hide the search/map-key buttons and mark the map as editing', () => {
      const { drawPlugin } = loadDrawPlugin()
      const mapElement = document.getElementById('map')
      drawPlugin.plugins = {
        search: { hideButton: jest.fn(), showButton: jest.fn() },
        mapKey: { hideButton: jest.fn(), showButton: jest.fn(), hidePanel: jest.fn(), reShowPanel: jest.fn() }
      }

      drawPlugin.toggleKeyWhenEditing(true)

      expect(mapElement.classList.contains('draw-editing')).toBe(true)
      expect(drawPlugin.plugins.search.hideButton).toHaveBeenCalled()
      expect(drawPlugin.plugins.mapKey.hideButton).toHaveBeenCalled()
      expect(drawPlugin.plugins.mapKey.hidePanel).toHaveBeenCalledWith('editing')
    })

    it('should show the search/map-key buttons and unmark the map when no longer editing', () => {
      const { drawPlugin } = loadDrawPlugin()
      const mapElement = document.getElementById('map')
      mapElement.classList.add('draw-editing')
      drawPlugin.plugins = {
        search: { hideButton: jest.fn(), showButton: jest.fn() },
        mapKey: { hideButton: jest.fn(), showButton: jest.fn(), hidePanel: jest.fn(), reShowPanel: jest.fn() }
      }

      drawPlugin.toggleKeyWhenEditing(false)

      expect(mapElement.classList.contains('draw-editing')).toBe(false)
      expect(drawPlugin.plugins.search.showButton).toHaveBeenCalled()
      expect(drawPlugin.plugins.mapKey.showButton).toHaveBeenCalled()
      expect(drawPlugin.plugins.mapKey.reShowPanel).toHaveBeenCalledWith('editing')
    })
  })

  describe('onEditPolygon', () => {
    let drawPlugin
    let interactiveMap

    beforeEach(() => {
      ;({ drawPlugin } = loadDrawPlugin())
      interactiveMap = buildInteractiveMap()
      drawPlugin.plugins = {
        search: { hideButton: jest.fn(), showButton: jest.fn() },
        mapKey: { hideButton: jest.fn(), showButton: jest.fn(), hidePanel: jest.fn(), reShowPanel: jest.fn() },
        interact: { hideInfoPanel: jest.fn(), triggerHitTest: jest.fn() },
        datasets: { ready: true, setDatasetVisibility: jest.fn() }
      }
      drawPlugin.interactiveMap = interactiveMap
    })

    it('should hide the info panel, search marker, menu and infoPanel button, and hide datasets when editing', () => {
      drawPlugin.onEditPolygon(true)

      expect(drawPlugin.plugins.interact.hideInfoPanel).toHaveBeenCalled()
      expect(interactiveMap.removeMarker).toHaveBeenCalledWith('search')
      expect(interactiveMap.hidePanel).toHaveBeenCalledWith('menu')
      expect(interactiveMap.toggleButtonState).toHaveBeenCalledWith('selectAtTarget', 'disabled', true)
      expect(drawPlugin.plugins.datasets.setDatasetVisibility).toHaveBeenCalledWith(false)
    })

    it('should not toggle dataset visibility while editing if the datasets plugin is not ready', () => {
      drawPlugin.plugins.datasets.ready = false

      drawPlugin.onEditPolygon(true)

      expect(drawPlugin.plugins.datasets.setDatasetVisibility).not.toHaveBeenCalled()
    })

    it('should show the menu on desktop, show datasets and trigger a hit test when no longer editing', () => {
      mockMapState.breakpoint = 'desktop'

      drawPlugin.onEditPolygon(false)

      expect(interactiveMap.showPanel).toHaveBeenCalledWith('menu')
      expect(drawPlugin.plugins.datasets.setDatasetVisibility).toHaveBeenCalledWith(true)
      expect(drawPlugin.plugins.interact.triggerHitTest).toHaveBeenCalled()
    })

    it('should not show the menu on non-desktop breakpoints when no longer editing', () => {
      mockMapState.breakpoint = 'mobile'

      drawPlugin.onEditPolygon(false)

      expect(interactiveMap.showPanel).not.toHaveBeenCalled()
    })
  })

  describe('attach', () => {
    let drawPlugin
    let interactiveMap

    beforeEach(() => {
      ;({ drawPlugin } = loadDrawPlugin())
      interactiveMap = buildInteractiveMap()
      drawPlugin.plugins = {
        search: { hideButton: jest.fn(), showButton: jest.fn() },
        mapKey: { hideButton: jest.fn(), showButton: jest.fn(), hidePanel: jest.fn(), reShowPanel: jest.fn() },
        interact: { hideInfoPanel: jest.fn(), triggerHitTest: jest.fn() },
        datasets: { ready: false, setDatasetVisibility: jest.fn() }
      }
      drawPlugin.addFeature = jest.fn()
      drawPlugin.newPolygon = jest.fn()
      drawPlugin.deleteFeature = jest.fn()
      drawPlugin.editFeature = jest.fn()
      mockFramePluginInstance.addFrame = jest.fn()
      mockFramePluginInstance.editFeature = jest.fn()

      drawPlugin.attach(interactiveMap)
    })

    it('should register handlers for all the draw/frame lifecycle events', () => {
      expect(interactiveMap.on).toHaveBeenCalledWith('map:ready', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('draw:ready', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('draw:done', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('draw:updated', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('frame:updated', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('draw:cancelled', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('frame:cancel', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('draw:deleted', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('frame:done', expect.any(Function))
      expect(interactiveMap.on).toHaveBeenCalledWith('app:panelopened', expect.any(Function))
    })

    it('should record the map view and add the draw menu buttons on map:ready', () => {
      const view = { center: { x: 1, y: 2 } }

      interactiveMap.trigger('map:ready', { view })

      expect(mockSiteBoundary.mapView).toBe(view)
      expect(interactiveMap.addButton).toHaveBeenCalledWith('geometryActions', expect.objectContaining({ variant: 'primary' }))
      expect(interactiveMap.addButton).toHaveBeenCalledWith('geometryActionsSecondary', expect.objectContaining({ variant: 'secondary' }))
      expect(interactiveMap.addButton).toHaveBeenCalledWith('get-summary', expect.objectContaining({ label: 'Get summary report' }))
    })

    it('should label the primary/secondary menu buttons for the current breakpoint', () => {
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')
      const [, secondaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActionsSecondary')

      expect(primaryOptions.label({ appState: { breakpoint: 'desktop' } })).toBe('Add location boundary')
      expect(primaryOptions.label({ appState: { breakpoint: 'mobile' } })).toBe('Add boundary')
      expect(secondaryOptions.label({ appState: { breakpoint: 'desktop' } })).toBe('Edit location boundary')
      expect(secondaryOptions.label({ appState: { breakpoint: 'mobile' } })).toBe('Edit boundary')
    })

    it('should navigate to the results page with the encoded polygon when get-summary is clicked', () => {
      mockSiteBoundary.encodedPolygon = 'ABC123'
      interactiveMap.trigger('map:ready', { view: {} })
      const [, summaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'get-summary')
      // jsdom doesn't implement navigation, so we can only verify the click handler runs without throwing
      jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => summaryOptions.onClick()).not.toThrow()
    })

    it('should build a menu item for each draw menu action, labelled from terms', () => {
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')

      const ids = primaryOptions.menuItems.map((item) => item.id)
      expect(ids).toEqual(['addPolygon', 'addSquare', 'uploadShape', 'editShape', 'deleteShape'])
      const addPolygonItem = primaryOptions.menuItems.find((item) => item.id === 'addPolygon')
      expect(addPolygonItem.label).toBe('Add polygon')
    })

    it('should start a new polygon and switch to editing state when addPolygon is clicked', () => {
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')
      const addPolygonItem = primaryOptions.menuItems.find((item) => item.id === 'addPolygon')

      addPolygonItem.onClick()

      expect(drawPlugin.newPolygon).toHaveBeenCalledWith('boundary')
      expect(mockSiteBoundary.state).toBe('editing')
      expect(mockSiteBoundary.type).toBe('polygon')
    })

    it('should add a square frame and switch to editing state when addSquare is clicked', () => {
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')
      const addSquareItem = primaryOptions.menuItems.find((item) => item.id === 'addSquare')

      addSquareItem.onClick()

      expect(mockFramePluginInstance.addFrame).toHaveBeenCalledWith('boundary', { aspectRatio: 1 })
      expect(mockSiteBoundary.state).toBe('editing')
      expect(mockSiteBoundary.type).toBe('square')
    })

    it('should navigate to the upload page when uploadShape is clicked', () => {
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')
      const uploadShapeItem = primaryOptions.menuItems.find((item) => item.id === 'uploadShape')
      // jsdom doesn't implement navigation, so we can only verify the click handler runs without throwing
      jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => uploadShapeItem.onClick()).not.toThrow()
    })

    it('should edit the polygon feature directly when editShape is clicked for a polygon', () => {
      mockSiteBoundary.isSquare = false
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')
      const editShapeItem = primaryOptions.menuItems.find((item) => item.id === 'editShape')

      editShapeItem.onClick()

      expect(drawPlugin.editFeature).toHaveBeenCalledWith('boundary')
      expect(mockSiteBoundary.state).toBe('editing')
    })

    it('should delete the drawn feature and hand off to the frame plugin when editShape is clicked for a square', () => {
      mockSiteBoundary.isSquare = true
      mockSiteBoundary.feature = { id: 'boundary' }
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')
      const editShapeItem = primaryOptions.menuItems.find((item) => item.id === 'editShape')

      editShapeItem.onClick()

      expect(drawPlugin.deleteFeature).toHaveBeenCalledWith('boundary')
      expect(mockFramePluginInstance.editFeature).toHaveBeenCalledWith(mockSiteBoundary.feature)
    })

    it('should delete the feature and clear the site boundary when deleteShape is clicked', () => {
      interactiveMap.trigger('map:ready', { view: {} })
      const [, primaryOptions] = interactiveMap.addButton.mock.calls.find(([id]) => id === 'geometryActions')
      const deleteShapeItem = primaryOptions.menuItems.find((item) => item.id === 'deleteShape')

      deleteShapeItem.onClick()

      expect(drawPlugin.deleteFeature).toHaveBeenCalledWith('boundary')
      expect(mockSiteBoundary.feature).toBeNull()
    })

    it('should show the dimensions panel and add back an existing feature on draw:ready', () => {
      mockSiteBoundary.feature = { id: 'boundary' }
      mockSiteBoundary.isEditing = true

      interactiveMap.trigger('draw:ready')

      expect(mockDimensionsPanelInstance.showPanel).toHaveBeenCalled()
      expect(drawPlugin.addFeature).toHaveBeenCalledWith(mockSiteBoundary.feature)
    })

    it('should not add back a feature on draw:ready when there is none', () => {
      mockSiteBoundary.feature = null

      interactiveMap.trigger('draw:ready')

      expect(drawPlugin.addFeature).not.toHaveBeenCalled()
    })

    it('should set the feature and polygon type on draw:done', () => {
      const feature = { id: 'boundary' }

      interactiveMap.trigger('draw:done', { newFeature: feature })

      expect(mockSiteBoundary.feature).toBe(feature)
      expect(mockSiteBoundary.type).toBe('polygon')
    })

    it('should update the dimensions panel on draw:updated and frame:updated', () => {
      const feature = { id: 'boundary' }

      interactiveMap.trigger('draw:updated', feature)
      interactiveMap.trigger('frame:updated', feature)

      expect(mockDimensionsPanelInstance.setFeatureValues).toHaveBeenCalledTimes(2)
      expect(mockDimensionsPanelInstance.setFeatureValues).toHaveBeenCalledWith(feature)
    })

    it('should restore the complete state on draw:cancelled when there is a feature', () => {
      mockSiteBoundary.feature = { id: 'boundary' }

      interactiveMap.trigger('draw:cancelled')

      expect(mockSiteBoundary.state).toBe('complete')
    })

    it('should restore the empty state on draw:cancelled when there is no feature', () => {
      mockSiteBoundary.feature = null

      interactiveMap.trigger('draw:cancelled')

      expect(mockSiteBoundary.state).toBe('empty')
    })

    it('should re-add the existing feature and cancel editing on frame:cancel', () => {
      mockSiteBoundary.feature = { id: 'boundary' }

      interactiveMap.trigger('frame:cancel')

      expect(drawPlugin.addFeature).toHaveBeenCalledWith(mockSiteBoundary.feature)
      expect(mockSiteBoundary.state).toBe('complete')
    })

    it('should not re-add a feature on frame:cancel when there is none', () => {
      mockSiteBoundary.feature = null

      interactiveMap.trigger('frame:cancel')

      expect(drawPlugin.addFeature).not.toHaveBeenCalled()
      expect(mockSiteBoundary.state).toBe('empty')
    })

    it('should clear the feature on draw:deleted', () => {
      mockSiteBoundary.feature = { id: 'boundary' }

      interactiveMap.trigger('draw:deleted')

      expect(mockSiteBoundary.feature).toBeNull()
    })

    it('should add the frame feature and switch to square type on frame:done', () => {
      const feature = { id: 'boundary' }

      interactiveMap.trigger('frame:done', feature)

      expect(drawPlugin.addFeature).toHaveBeenCalledWith(feature)
      expect(mockSiteBoundary.feature).toBe(feature)
      expect(mockSiteBoundary.type).toBe('square')
    })

    it('should update the dimensions panel values when the dimensions panel is opened', () => {
      mockSiteBoundary.feature = { id: 'boundary' }

      interactiveMap.trigger('app:panelopened', { panelId: 'dimensions-panel' })

      expect(mockDimensionsPanelInstance.setFeatureValues).toHaveBeenCalledWith(mockSiteBoundary.feature)
    })

    it('should ignore app:panelopened for other panels', () => {
      interactiveMap.trigger('app:panelopened', { panelId: 'menu' })

      expect(mockDimensionsPanelInstance.setFeatureValues).not.toHaveBeenCalled()
    })
  })

  describe('attach when onEditPolygon is not defined', () => {
    it('should update the draw state without calling onEditPolygon', () => {
      const { drawPlugin } = loadDrawPlugin()
      const interactiveMap = buildInteractiveMap()
      // Simulate onEditPolygon not being set up yet when attach() runs
      drawPlugin.onEditPolygon = undefined

      drawPlugin.attach(interactiveMap)
      interactiveMap.trigger('draw:done', { newFeature: { id: 'boundary' } })

      expect(interactiveMap.toggleButtonState).toHaveBeenCalledWith('uploadShape', 'disabled', !mockSiteBoundary.isEmpty)
    })
  })
})
