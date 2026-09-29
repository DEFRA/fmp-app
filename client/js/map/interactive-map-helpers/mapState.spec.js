const setUrl = (url) => {
  window.history.replaceState({}, '', url)
}

const loadMapState = () => {
  jest.resetModules()
  return require('./mapState.js').mapState
}

describe('mapState', () => {
  afterEach(() => {
    setUrl('http://localhost/')
    document.body.innerHTML = ''
  })

  describe('construction', () => {
    it('should have no location when there is none in the url', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()

      expect(mapState.location).toBeUndefined()
    })

    it('should capture the location from the url and strip it from the query string', () => {
      setUrl('http://localhost/?location=Bristol')
      const mapState = loadMapState()

      expect(mapState.location).toBe('Bristol')
      expect(window.location.search).not.toContain('location')
    })
  })

  describe('breakpoint', () => {
    it('should default to desktop when there is no map element', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()

      expect(mapState.breakpoint).toBe('desktop')
    })

    it('should read the breakpoint from the map element dataset', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const mapElement = document.createElement('div')
      mapElement.id = 'map'
      mapElement.dataset.breakpoint = 'mobile'
      document.body.appendChild(mapElement)

      expect(mapState.breakpoint).toBe('mobile')
    })
  })

  describe('attach', () => {
    it('should store the interactive map and listen for map:ready', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const interactiveMap = { on: jest.fn() }

      mapState.attach(interactiveMap)

      expect(mapState.interactiveMap).toBe(interactiveMap)
      expect(interactiveMap.on).toHaveBeenCalledWith('map:ready', expect.any(Function))
    })
  })

  describe('onMapReady', () => {
    it('should store the map and view', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const map = {}
      const view = { center: { x: 1, y: 2 } }

      mapState.onMapReady({ map, view })

      expect(mapState.map).toBe(map)
      expect(mapState.view).toBe(view)
    })

    it('should add a labelled search marker when a location was passed in from the url', () => {
      setUrl('http://localhost/?location=Bristol')
      const mapState = loadMapState()
      mapState.interactiveMap = { addMarker: jest.fn() }
      const view = { center: { x: 1, y: 2 } }

      mapState.onMapReady({ map: {}, view })

      expect(mapState.interactiveMap.addMarker).toHaveBeenCalledWith(
        'search',
        [1, 2],
        expect.objectContaining({ label: 'Bristol', showLabel: true })
      )
    })

    it('should not add a marker when there is no location', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      mapState.interactiveMap = { addMarker: jest.fn() }

      mapState.onMapReady({ map: {}, view: { center: { x: 1, y: 2 } } })

      expect(mapState.interactiveMap.addMarker).not.toHaveBeenCalled()
    })
  })

  describe('updateVisibleLayers', () => {
    it('should keep only visible, non-baselayer vector-tile layers', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      mapState.map = {
        allLayers: {
          items: [
            { type: 'vector-tile', visible: true, id: 'floodZones' },
            { type: 'vector-tile', visible: false, id: 'surfaceWater' },
            { type: 'vector-tile', visible: true, id: 'baselayer' },
            { type: 'other', visible: true, id: 'notVectorTile' }
          ]
        }
      }

      mapState.updateVisibleLayers()

      expect(mapState.visibleLayers).toEqual([
        { type: 'vector-tile', visible: true, id: 'floodZones' }
      ])
    })

    it('should not throw when there is no map', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()

      expect(() => mapState.updateVisibleLayers()).not.toThrow()
      expect(mapState.visibleLayers).toBeUndefined()
    })
  })

  describe('getInfoPanelDataForEsriStyleLayerId', () => {
    it('should return the mapped values for a known style layer id', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      mapState.styleToValuesMap = { layer1: { ds: 'floodZones' } }

      expect(mapState.getInfoPanelDataForEsriStyleLayerId('layer1')).toEqual({ ds: 'floodZones' })
    })

    it('should return null for an unknown style layer id', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()

      expect(mapState.getInfoPanelDataForEsriStyleLayerId('unknown')).toBeNull()
    })
  })

  describe('assignCursorStyleLayer', () => {
    it('should clear the cursor style when there are no hitTest results', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()

      mapState.assignCursorStyleLayer({ results: [] })

      expect(mapState.cursorStyleLayer).toBeNull()
      expect(mapState.cursorAttributes).toBeNull()
      expect(document.body.style.cursor).toBe('default')
    })

    it('should clear the cursor style when there is no hitTestResponse at all', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()

      mapState.assignCursorStyleLayer(undefined)

      expect(mapState.cursorStyleLayer).toBeNull()
      expect(document.body.style.cursor).toBe('default')
    })

    it('should clear the cursor style when the hitTestResponse has no results property', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()

      mapState.assignCursorStyleLayer({})

      expect(mapState.cursorStyleLayer).toBeNull()
      expect(document.body.style.cursor).toBe('default')
    })

    it('should set the cursor style layer for the top visible hit', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const hitTestResponse = {
        results: [
          {
            graphic: { origin: { layerId: 'layer1' }, attributes: { a: 1 } },
            layer: { getStyleLayer: jest.fn().mockReturnValue({ layout: { visibility: 'visible' } }) }
          }
        ]
      }

      mapState.assignCursorStyleLayer(hitTestResponse)

      expect(mapState.cursorStyleLayer).toBe('layer1')
      expect(mapState.cursorAttributes).toEqual({ a: 1 })
      expect(document.body.style.cursor).toBe('pointer')
    })

    it('should ignore results without a layerId', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const hitTestResponse = {
        results: [
          { graphic: { origin: {}, attributes: {} }, layer: { getStyleLayer: jest.fn() } }
        ]
      }

      mapState.assignCursorStyleLayer(hitTestResponse)

      expect(mapState.cursorStyleLayer).toBeNull()
    })

    it('should ignore results whose graphic has no origin at all', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const hitTestResponse = {
        results: [
          { graphic: { attributes: {} }, layer: { getStyleLayer: jest.fn() } }
        ]
      }

      mapState.assignCursorStyleLayer(hitTestResponse)

      expect(mapState.cursorStyleLayer).toBeNull()
    })

    it('should ignore results whose style layer is not visible', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const hitTestResponse = {
        results: [
          {
            graphic: { origin: { layerId: 'layer1' }, attributes: {} },
            layer: { getStyleLayer: jest.fn().mockReturnValue({ layout: { visibility: 'none' } }) }
          }
        ]
      }

      mapState.assignCursorStyleLayer(hitTestResponse)

      expect(mapState.cursorStyleLayer).toBeNull()
      expect(document.body.style.cursor).toBe('default')
    })
  })

  describe('initPointerMove', () => {
    it('should update visible layers on pointer-enter', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const view = { on: jest.fn(), scale: 0 }
      mapState.view = view
      jest.spyOn(mapState, 'updateVisibleLayers')

      mapState.initPointerMove()
      const onPointerEnter = view.on.mock.calls.find(([name]) => name === 'pointer-enter')[1]
      onPointerEnter()

      expect(mapState.updateVisibleLayers).toHaveBeenCalled()
    })

    it('should hitTest and set the cursor to default on pointer-move when nothing is hit', async () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const hitTestResponse = { results: [] }
      const view = {
        on: jest.fn(),
        scale: 1000,
        hitTest: jest.fn().mockResolvedValue(hitTestResponse)
      }
      mapState.view = view
      mapState.interfaceType = 'mouse'
      mapState.visibleLayers = ['layer1']

      mapState.initPointerMove()
      const onPointerMove = view.on.mock.calls.find(([name]) => name === 'pointer-move')[1]
      await onPointerMove({ x: 1, y: 1 })

      expect(view.hitTest).toHaveBeenCalledWith({ x: 1, y: 1 }, { include: ['layer1'] })
      expect(document.body.style.cursor).toBe('default')
    })

    it('should hitTest and set the cursor to pointer on pointer-move when a visible feature is hit', async () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const hitTestResponse = {
        results: [{
          graphic: { origin: { layerId: 'layer1' }, attributes: {} },
          layer: { getStyleLayer: jest.fn().mockReturnValue({ layout: { visibility: 'visible' } }) }
        }]
      }
      const view = {
        on: jest.fn(),
        scale: 1000,
        hitTest: jest.fn().mockResolvedValue(hitTestResponse)
      }
      mapState.view = view
      mapState.interfaceType = 'mouse'
      mapState.visibleLayers = ['layer1']

      mapState.initPointerMove()
      const onPointerMove = view.on.mock.calls.find(([name]) => name === 'pointer-move')[1]
      await onPointerMove({ x: 1, y: 1 })

      expect(document.body.style.cursor).toBe('pointer')
    })

    it('should skip the hitTest on pointer-move when the interface is not a mouse', async () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const view = { on: jest.fn(), scale: 1000, hitTest: jest.fn() }
      mapState.view = view
      mapState.interfaceType = 'touch'
      mapState.visibleLayers = ['layer1']

      mapState.initPointerMove()
      const onPointerMove = view.on.mock.calls.find(([name]) => name === 'pointer-move')[1]
      await onPointerMove({ x: 1, y: 1 })

      expect(view.hitTest).not.toHaveBeenCalled()
    })

    it('should skip the hitTest on pointer-move when there are no visible layers', async () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const view = { on: jest.fn(), scale: 1000, hitTest: jest.fn() }
      mapState.view = view
      mapState.interfaceType = 'mouse'
      mapState.visibleLayers = null

      mapState.initPointerMove()
      const onPointerMove = view.on.mock.calls.find(([name]) => name === 'pointer-move')[1]
      await onPointerMove({ x: 1, y: 1 })

      expect(view.hitTest).not.toHaveBeenCalled()
    })

    it('should skip the hitTest on pointer-move when the view is zoomed out beyond the min scale', async () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const view = { on: jest.fn(), scale: 999999, hitTest: jest.fn() }
      mapState.view = view
      mapState.interfaceType = 'mouse'
      mapState.visibleLayers = ['layer1']

      mapState.initPointerMove()
      const onPointerMove = view.on.mock.calls.find(([name]) => name === 'pointer-move')[1]
      await onPointerMove({ x: 1, y: 1 })

      expect(view.hitTest).not.toHaveBeenCalled()
    })

    it('should reset the cursor and clear visible layers on pointer-leave for a mouse', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const view = { on: jest.fn(), scale: 0 }
      mapState.view = view
      mapState.interfaceType = 'mouse'
      mapState.visibleLayers = ['layer1']
      document.body.style.cursor = 'pointer'

      mapState.initPointerMove()
      const onPointerLeave = view.on.mock.calls.find(([name]) => name === 'pointer-leave')[1]
      onPointerLeave()

      expect(document.body.style.cursor).toBe('default')
      expect(mapState.visibleLayers).toBeNull()
    })

    it('should do nothing on pointer-leave for a touch interface', () => {
      setUrl('http://localhost/')
      const mapState = loadMapState()
      const view = { on: jest.fn(), scale: 0 }
      mapState.view = view
      mapState.interfaceType = 'touch'
      mapState.visibleLayers = ['layer1']
      document.body.style.cursor = 'pointer'

      mapState.initPointerMove()
      const onPointerLeave = view.on.mock.calls.find(([name]) => name === 'pointer-leave')[1]
      onPointerLeave()

      expect(document.body.style.cursor).toBe('pointer')
      expect(mapState.visibleLayers).toEqual(['layer1'])
    })
  })
})
