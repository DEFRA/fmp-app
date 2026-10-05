const { encodePolygon } = require('../../../../server/services/shape-utils.js')

const setUrl = (url) => {
  window.history.replaceState({}, '', url)
}

const loadSiteBoundary = () => {
  jest.resetModules()
  return require('./siteBoundary.js')
}

const square = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]

describe('SiteBoundary', () => {
  afterEach(() => {
    setUrl('http://localhost/')
  })

  describe('construction from the url', () => {
    it('should be empty when there is no polygon in the url', () => {
      setUrl('http://localhost/')
      const { SiteBoundary } = loadSiteBoundary()

      const boundary = new SiteBoundary()

      expect(boundary.isEmpty).toBe(true)
      expect(boundary.coordinates).toBeUndefined()
    })

    it('should initialise from a plain polygon query param', () => {
      const polygonString = JSON.stringify(square)
      setUrl(`http://localhost/?polygon=${encodeURIComponent(polygonString)}`)
      const { SiteBoundary } = loadSiteBoundary()

      const boundary = new SiteBoundary()

      expect(boundary.isComplete).toBe(true)
      expect(boundary.isPolygon).toBe(true)
      expect(boundary.coordinates).toEqual([square])
    })

    it('should initialise from an encodedPolygon query param', () => {
      const encoded = encodePolygon(square)
      setUrl(`http://localhost/?encodedPolygon=${encodeURIComponent(encoded)}`)
      const { SiteBoundary } = loadSiteBoundary()

      const boundary = new SiteBoundary()

      expect(boundary.isComplete).toBe(true)
      expect(boundary.coordinates).toEqual([square])
    })

    it('should be empty when the polygon in the url cannot be parsed', () => {
      setUrl('http://localhost/?polygon=not-json')
      const { SiteBoundary } = loadSiteBoundary()

      const boundary = new SiteBoundary()

      expect(boundary.isEmpty).toBe(true)
    })
  })

  describe('feature setter/getter', () => {
    let SiteBoundary
    let boundary

    beforeEach(() => {
      setUrl('http://localhost/')
      ;({ SiteBoundary } = loadSiteBoundary())
      boundary = new SiteBoundary('my-boundary')
      boundary.onSetFeature = jest.fn()
    })

    it('should round coordinates to 2 decimal places and merge id into properties', () => {
      boundary.feature = {
        geometry: { coordinates: [[[0.123, 0.456], [10.999, 0]]] },
        properties: { foo: 'bar' }
      }

      expect(boundary.feature.geometry.coordinates).toEqual([[[0.12, 0.46], [11, 0]]])
      expect(boundary.feature.properties).toEqual({ foo: 'bar', id: 'my-boundary' })
      expect(boundary.isComplete).toBe(true)
      expect(boundary.onSetFeature).toHaveBeenCalledWith(boundary.feature)
    })

    it('should update the encodedPolygon query param when a feature is set', () => {
      boundary.feature = { geometry: { coordinates: [square] }, properties: {} }

      expect(window.location.search).toContain('encodedPolygon=')
    })

    it('should clear state and query params when the feature is set to null', () => {
      boundary.feature = { geometry: { coordinates: [square] }, properties: {} }

      boundary.feature = null

      expect(boundary.isEmpty).toBe(true)
      expect(boundary.feature).toBeNull()
      expect(window.location.search).not.toContain('encodedPolygon')
      expect(boundary.onSetFeature).toHaveBeenLastCalledWith(null)
    })

    it('should treat a feature with no geometry coordinates as empty', () => {
      boundary.feature = { geometry: {}, properties: {} }

      expect(boundary.isEmpty).toBe(true)
    })
  })

  describe('extents and buffedExtents', () => {
    let SiteBoundary
    let boundary

    beforeEach(() => {
      setUrl('http://localhost/')
      ;({ SiteBoundary } = loadSiteBoundary())
      boundary = new SiteBoundary()
    })

    it('should return null extents when there are no coordinates', () => {
      expect(boundary.extents).toBeNull()
      expect(boundary.buffedExtents).toBeNull()
    })

    it('should compute the west/south/east/north extents of the polygon', () => {
      boundary.coordinates = [square]

      expect(boundary.extents).toEqual([0, 0, 10, 10])
    })

    it('should buffer the extents by half the width/height', () => {
      boundary.coordinates = [square]

      expect(boundary.buffedExtents).toEqual([-5, -5, 15, 15])
    })
  })

  describe('encodedPolygon', () => {
    it('should return null when there are no coordinates', () => {
      setUrl('http://localhost/')
      const { SiteBoundary } = loadSiteBoundary()
      const boundary = new SiteBoundary()

      expect(boundary.encodedPolygon).toBeNull()
    })

    it('should encode the first ring of coordinates', () => {
      setUrl('http://localhost/')
      const { SiteBoundary } = loadSiteBoundary()
      const boundary = new SiteBoundary()
      boundary.coordinates = [square]

      expect(boundary.encodedPolygon).toBe(encodePolygon(square))
    })
  })

  describe('mapView, resetZoom and zoomOnSquare', () => {
    let SiteBoundary
    let boundary

    beforeEach(() => {
      setUrl('http://localhost/')
      ;({ SiteBoundary } = loadSiteBoundary())
      boundary = new SiteBoundary()
    })

    it('should default maxZoom to 20 when the map view has no constraints', () => {
      expect(boundary.maxZoom).toBe(20)
    })

    it('should adopt the maxZoom from the map view constraints when attached', () => {
      boundary.mapView = { constraints: { maxZoom: 18 } }

      expect(boundary.maxZoom).toBe(18)
    })

    it('should keep the current maxZoom when the map view has no constraints', () => {
      boundary.maxZoom = 15

      boundary.mapView = null

      expect(boundary.maxZoom).toBe(15)
    })

    it('should do nothing when resetting zoom without a map view', () => {
      expect(() => boundary.resetZoom()).not.toThrow()
    })

    it('should reset the map view zoom to maxZoom', () => {
      const mapView = { constraints: { maxZoom: 18 }, goTo: jest.fn() }
      boundary.mapView = mapView
      boundary.maxZoom = 15

      boundary.resetZoom()

      expect(mapView.constraints.maxZoom).toBe(15)
    })

    it('should do nothing when zooming to a square without a map view', () => {
      expect(() => boundary.zoomOnSquare()).not.toThrow()
    })

    it('should zoom in to the frameMaxZoom and pan to the current centre for a square', () => {
      const mapView = { constraints: { maxZoom: 18 }, center: { x: 1, y: 2 }, goTo: jest.fn() }
      boundary.mapView = mapView

      boundary.zoomOnSquare()

      expect(mapView.constraints.maxZoom).toBe(boundary.frameMaxZoom)
      expect(mapView.goTo).toHaveBeenCalledWith({ center: mapView.center, zoom: boundary.frameMaxZoom, duration: 200 })
    })
  })

  describe('type/state flags', () => {
    let SiteBoundary
    let boundary

    beforeEach(() => {
      setUrl('http://localhost/')
      ;({ SiteBoundary } = loadSiteBoundary())
      boundary = new SiteBoundary()
    })

    it('should identify a square boundary', () => {
      boundary.type = SiteBoundary.SQUARE
      expect(boundary.isSquare).toBe(true)
      expect(boundary.isPolygon).toBe(false)
    })

    it('should identify an editing state', () => {
      boundary.state = SiteBoundary.EDITING
      expect(boundary.isEditing).toBe(true)
      expect(boundary.isComplete).toBe(false)
    })
  })

  describe('singleton export', () => {
    it('should export a ready-to-use SiteBoundary instance initialised from the current url', () => {
      const polygonString = JSON.stringify(square)
      setUrl(`http://localhost/?polygon=${encodeURIComponent(polygonString)}`)
      const { siteBoundary, SiteBoundary } = loadSiteBoundary()

      expect(siteBoundary).toBeInstanceOf(SiteBoundary)
      expect(siteBoundary.isComplete).toBe(true)
    })
  })
})
