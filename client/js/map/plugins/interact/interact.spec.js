// Shared mocks - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instances survive the jest.resetModules() calls used to reload interact.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map/plugins/interact', () => mockInteractiveMapMocks.interactPlugin)
const mockCreateInteractPlugin = mockInteractiveMapMocks.interactPlugin.default

const mockGetInfoPanel = jest.fn()
jest.mock('../../infoPanel.js', () => ({
  getInfoPanel: (...args) => mockGetInfoPanel(...args)
}))

const mockHideDatasetsKey = jest.fn()
const mockReShowDatasetsKey = jest.fn()
jest.mock('../datasets/showHideDatasetsKey.js', () => ({
  hideDatasetsKey: (...args) => mockHideDatasetsKey(...args),
  reShowDatasetsKey: (...args) => mockReShowDatasetsKey(...args)
}))

const mockMapState = {
  interfaceType: null,
  view: null,
  cursorStyleLayer: null,
  cursorAttributes: null,
  visibleLayers: null,
  defraMapConfig: { version: '1.0' },
  updateVisibleLayers: jest.fn(),
  assignCursorStyleLayer: jest.fn(),
  getInfoPanelDataForEsriStyleLayerId: jest.fn()
}
jest.mock('../../interactive-map-helpers/mapState.js', () => ({
  mapState: mockMapState
}))

const buildInteractiveMap = () => {
  const handlers = {}
  return {
    on: jest.fn((event, handler) => { handlers[event] = handler }),
    trigger: (event, ...args) => handlers[event](...args),
    toggleButtonState: jest.fn(),
    addPanel: jest.fn(),
    removePanel: jest.fn(),
    removeMarker: jest.fn()
  }
}

const loadInteract = () => {
  jest.resetModules()
  mockCreateInteractPlugin.mockReturnValue({ enable: jest.fn() })
  return require('./interact.js')
}

describe('interactPlugin', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(mockMapState, {
      interfaceType: null,
      view: {
        toScreen: jest.fn().mockResolvedValue({ x: 1, y: 2 }),
        center: { x: 1, y: 2 },
        hitTest: jest.fn().mockResolvedValue({ results: [] })
      },
      cursorStyleLayer: null,
      cursorAttributes: null,
      visibleLayers: null,
      defraMapConfig: { version: '1.0' }
    })
    mockMapState.getInfoPanelDataForEsriStyleLayerId.mockReturnValue({ ds: 'floodZones' })
  })

  describe('manifest button enableWhen', () => {
    const getEnableWhen = () => mockCreateInteractPlugin.mock.calls[0][0].manifest.buttons[0].enableWhen

    it('should save the interfaceType and disable the button for a mouse interface', () => {
      loadInteract()
      const enableWhen = getEnableWhen()

      const result = enableWhen({ appState: { interfaceType: 'mouse' } })

      expect(mockMapState.interfaceType).toBe('mouse')
      expect(result).toBe(false)
    })

    it('should default to a mouse interface when there is no event', () => {
      loadInteract()
      const enableWhen = getEnableWhen()

      const result = enableWhen(undefined)

      expect(mockMapState.interfaceType).toBe('mouse')
      expect(result).toBe(false)
    })

    it('should enable the button on a touch interface only once a feature has been hit', async () => {
      const { interactPlugin } = loadInteract()
      const interactiveMap = buildInteractiveMap()
      interactPlugin.attach(interactiveMap)
      const enableWhen = getEnableWhen()

      expect(enableWhen({ appState: { interfaceType: 'touch' } })).toBe(false)

      mockMapState.cursorStyleLayer = 'layer-1'
      await interactPlugin.triggerHitTest()

      expect(enableWhen({ appState: { interfaceType: 'touch' } })).toBe(true)
    })
  })

  describe('triggerHitTest', () => {
    it('should hit test the current view centre and toggle the selectAtTarget button state', async () => {
      const { interactPlugin } = loadInteract()
      const interactiveMap = buildInteractiveMap()
      interactPlugin.attach(interactiveMap)
      mockMapState.visibleLayers = ['layer-1']

      await interactPlugin.triggerHitTest()

      expect(mockMapState.view.toScreen).toHaveBeenCalledWith(mockMapState.view.center)
      expect(mockMapState.updateVisibleLayers).toHaveBeenCalled()
      expect(mockMapState.view.hitTest).toHaveBeenCalledWith({ x: 1, y: 2 }, { include: ['layer-1'] })
      expect(mockMapState.assignCursorStyleLayer).toHaveBeenCalled()
    })

    it('should toggle selectAtTarget disabled state to false when nothing is under the cursor', async () => {
      const { interactPlugin } = loadInteract()
      const interactiveMap = buildInteractiveMap()
      interactPlugin.attach(interactiveMap)
      mockMapState.cursorStyleLayer = null

      await interactPlugin.triggerHitTest()

      expect(interactiveMap.toggleButtonState).toHaveBeenCalledWith('selectAtTarget', 'disabled', false)
    })

    it('should toggle selectAtTarget disabled state to true when a feature is under the cursor', async () => {
      const { interactPlugin } = loadInteract()
      const interactiveMap = buildInteractiveMap()
      interactPlugin.attach(interactiveMap)
      mockMapState.cursorStyleLayer = 'layer-1'

      await interactPlugin.triggerHitTest()

      expect(interactiveMap.toggleButtonState).toHaveBeenCalledWith('selectAtTarget', 'disabled', true)
    })
  })

  describe('attach', () => {
    let interactPlugin
    let interactiveMap

    beforeEach(() => {
      ;({ interactPlugin } = loadInteract())
      interactiveMap = buildInteractiveMap()
      interactPlugin.attach(interactiveMap)
    })

    it('should enable the plugin on map:ready', () => {
      interactiveMap.trigger('map:ready')

      expect(interactPlugin.enable).toHaveBeenCalled()
    })

    it('should hit test and show the info panel when the marker moves onto a feature', async () => {
      mockMapState.cursorStyleLayer = 'layer-1'
      jest.spyOn(interactPlugin, 'showInfoPanel')
      mockGetInfoPanel.mockResolvedValue({ width: '360px', label: 'Flood zone 2', html: '<p>info</p>' })

      await interactiveMap.trigger('interact:markerchange', { coords: [530000, 180000] })

      expect(mockMapState.view.toScreen).toHaveBeenCalledWith({ x: 530000, y: 180000 })
      expect(interactPlugin.showInfoPanel).toHaveBeenCalledWith([530000, 180000])
    })

    it('should hide the info panel when the marker moves off a feature', async () => {
      mockMapState.cursorStyleLayer = null
      jest.spyOn(interactPlugin, 'hideInfoPanel')

      await interactiveMap.trigger('interact:markerchange', { coords: [530000, 180000] })

      expect(interactPlugin.hideInfoPanel).toHaveBeenCalled()
    })

    describe('showInfoPanel', () => {
      it('should build the info panel from the cursor style layer data, rounded coords and map version', async () => {
        mockMapState.cursorStyleLayer = 'layer-1'
        mockMapState.cursorAttributes = {}
        mockGetInfoPanel.mockResolvedValue({ width: '360px', label: 'Flood zone 2', html: '<p>info</p>' })

        await interactPlugin.showInfoPanel([530000.6, 180000.4])

        expect(mockMapState.getInfoPanelDataForEsriStyleLayerId).toHaveBeenCalledWith('layer-1')
        expect(mockGetInfoPanel).toHaveBeenCalledWith({
          ds: 'floodZones',
          coords: '530001,180000',
          version: '1.0'
        })
      })

      it('should include the flood source when the cursor attributes have one', async () => {
        mockMapState.cursorAttributes = { flood_source: 'Fluvial' }
        mockGetInfoPanel.mockResolvedValue({ width: '360px', label: 'Flood zone 2', html: '<p>info</p>' })

        await interactPlugin.showInfoPanel([1, 2])

        expect(mockGetInfoPanel).toHaveBeenCalledWith(expect.objectContaining({ fs: 'Fluvial' }))
      })

      it('should add the info panel with the label, html and width from getInfoPanel', async () => {
        mockGetInfoPanel.mockResolvedValue({ width: '360px', label: 'Flood zone 2', html: '<p>info</p>' })

        await interactPlugin.showInfoPanel([1, 2])

        expect(interactiveMap.addPanel).toHaveBeenCalledWith('info', {
          label: 'Flood zone 2',
          html: '<p>info</p>',
          mobile: { slot: 'drawer', modal: false, open: true },
          tablet: { slot: 'left-top', width: '360px', open: true },
          desktop: { slot: 'left-top', width: '360px', open: true }
        })
      })
    })

    describe('hideInfoPanel', () => {
      it('should remove the info panel when it is currently visible', () => {
        const infoPanelElement = document.createElement('div')
        infoPanelElement.id = 'map-panel-info'
        infoPanelElement.checkVisibility = () => true
        document.body.appendChild(infoPanelElement)

        interactPlugin.hideInfoPanel()

        expect(interactiveMap.removePanel).toHaveBeenCalledWith('info')
      })

      it('should not remove the info panel when it is not visible', () => {
        interactPlugin.hideInfoPanel()

        expect(interactiveMap.removePanel).not.toHaveBeenCalled()
      })

      it('should always remove the info panel marker', () => {
        interactPlugin.hideInfoPanel()

        expect(interactiveMap.removeMarker).toHaveBeenCalledWith('infoPanelMarker')
      })
    })

    describe('dismissing the info panel on filter change', () => {
      it.each(['dataset', 'timeframe', 'aep', 'depth'])('should hide the info panel when the %s filter changes', (name) => {
        jest.spyOn(interactPlugin, 'hideInfoPanel')
        const target = document.createElement('select')
        target.name = name
        document.body.appendChild(target)

        target.dispatchEvent(new window.Event('change', { bubbles: true }))

        expect(interactPlugin.hideInfoPanel).toHaveBeenCalled()
      })

      it('should not hide the info panel for unrelated form field changes', () => {
        jest.spyOn(interactPlugin, 'hideInfoPanel')
        const target = document.createElement('input')
        target.name = 'something-else'
        document.body.appendChild(target)

        target.dispatchEvent(new window.Event('change', { bubbles: true }))

        expect(interactPlugin.hideInfoPanel).not.toHaveBeenCalled()
      })
    })

    describe('panel close/removal', () => {
      it('should hide the marker and re-show the datasets key when the info panel is closed', () => {
        jest.spyOn(interactPlugin, 'hideInfoPanelMarker')

        interactiveMap.trigger('app:panelclosed', { panelId: 'info' })

        expect(interactPlugin.hideInfoPanelMarker).toHaveBeenCalled()
        expect(mockReShowDatasetsKey).toHaveBeenCalledWith('info')
      })

      it('should ignore app:panelclosed for other panels', () => {
        jest.spyOn(interactPlugin, 'hideInfoPanelMarker')

        interactiveMap.trigger('app:panelclosed', { panelId: 'menu' })

        expect(interactPlugin.hideInfoPanelMarker).not.toHaveBeenCalled()
        expect(mockReShowDatasetsKey).not.toHaveBeenCalled()
      })

      it('should hide the marker and re-show the datasets key when the info panel is removed', () => {
        jest.spyOn(interactPlugin, 'hideInfoPanelMarker')

        interactiveMap.trigger('app:removepanel', 'info')

        expect(interactPlugin.hideInfoPanelMarker).toHaveBeenCalled()
        expect(mockReShowDatasetsKey).toHaveBeenCalledWith('info')
      })
    })

    describe('panel opened', () => {
      it('should hide the datasets key when the info panel opens', () => {
        interactiveMap.trigger('app:panelopened', { panelId: 'info' })

        expect(mockHideDatasetsKey).toHaveBeenCalledWith('info')
      })

      it('should hide the info panel when the map key panel opens', () => {
        jest.spyOn(interactPlugin, 'hideInfoPanel')

        interactiveMap.trigger('app:panelopened', { panelId: 'mapKey' })

        expect(interactPlugin.hideInfoPanel).toHaveBeenCalled()
      })

      it('should do nothing for unrelated panels', () => {
        interactiveMap.trigger('app:panelopened', { panelId: 'menu' })

        expect(mockHideDatasetsKey).not.toHaveBeenCalled()
      })
    })
  })
})
