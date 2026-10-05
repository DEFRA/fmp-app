// Shared @arcgis/core mocks - see client/js/__test-helpers__/arcgisCoreMocks.js
// to add a new subpath mock instead of redefining a constructor mock inline.
// NB: captured once (not required freshly inside each factory) so the same jest.fn()
// instances survive the jest.resetModules() calls used to reload ./index.js per test.
const mockArcgisCoreMocks = require('../__test-helpers__/arcgisCoreMocks')
jest.mock('@arcgis/core/config.js', () => mockArcgisCoreMocks.config)
jest.mock('@arcgis/core/Map', () => mockArcgisCoreMocks.Map)
jest.mock('@arcgis/core/views/MapView', () => mockArcgisCoreMocks.MapView)
jest.mock('@arcgis/core/layers/WMTSLayer', () => mockArcgisCoreMocks.WMTSLayer)
jest.mock('@arcgis/core/layers/support/TileInfo', () => mockArcgisCoreMocks.TileInfo)
jest.mock('@arcgis/core/geometry/Point', () => mockArcgisCoreMocks.Point)
jest.mock('@arcgis/core/geometry/Extent', () => mockArcgisCoreMocks.Extent)
jest.mock('@arcgis/core/layers/GraphicsLayer', () => mockArcgisCoreMocks.GraphicsLayer)
jest.mock('@arcgis/core/Graphic', () => mockArcgisCoreMocks.Graphic)
jest.mock('@arcgis/core/widgets/ScaleBar', () => mockArcgisCoreMocks.ScaleBar)

const mockEsriConfig = mockArcgisCoreMocks.config.default
const mockMapConstructor = mockArcgisCoreMocks.Map.default

// Mutable instance re-created per-test in beforeEach so mocks don't leak between tests
let mockMapViewInstance
const mockMapViewConstructor = mockArcgisCoreMocks.MapView.default

const mockWMTSLayerConstructor = mockArcgisCoreMocks.WMTSLayer.default

const { create: mockTileInfoCreate } = mockArcgisCoreMocks.TileInfo.default

const mockPointConstructor = mockArcgisCoreMocks.Point.default

const mockExtentConstructor = mockArcgisCoreMocks.Extent.default

const mockGraphicsLayerAdd = jest.fn()
const mockGraphicsLayerConstructor = mockArcgisCoreMocks.GraphicsLayer.default

const mockGraphicConstructor = mockArcgisCoreMocks.Graphic.default

const mockScaleBarConstructor = mockArcgisCoreMocks.ScaleBar.default

const mockGetOsToken = jest.fn()
const mockGetEsriToken = jest.fn()
jest.mock('../map/tokens', () => ({
  getOsToken: (...args) => mockGetOsToken(...args),
  getEsriToken: (...args) => mockGetEsriToken(...args)
}))

const loadModule = () => {
  document.body.innerHTML = `
    <form>
      <button class="order-product-four"></button>
    </form>
  `
  jest.resetModules()
  return require('./index.js')
}

// Finds the callback registered via view.on(eventName, [modifiers], callback)
// with an optional modifiers array of the given length
const findOnHandler = (eventName, modifiersLength) => {
  const call = mockMapViewInstance.on.mock.calls.find(([name, second]) => {
    if (name !== eventName) {
      return false
    }
    const hasModifiers = Array.isArray(second)
    if (modifiersLength === undefined) {
      return !hasModifiers
    }
    return hasModifiers && second.length === modifiersLength
  })
  return call[call.length - 1]
}

describe('check-your-details', () => {
  beforeEach(() => {
    mockEsriConfig.apiKey = ''
    mockEsriConfig.request.interceptors = []

    mockMapConstructor.mockImplementation(function (args) {
      this.layers = args.layers
    })

    mockMapViewInstance = {
      on: jest.fn(),
      whenLayerView: jest.fn().mockResolvedValue({ watch: jest.fn() }),
      ui: { add: jest.fn(), padding: {} }
    }
    mockMapViewConstructor.mockImplementation(function (args) {
      this.config = args
      Object.assign(this, mockMapViewInstance)
    })

    mockTileInfoCreate.mockReturnValue({ lods: ['lod-mock'] })

    mockGraphicsLayerConstructor.mockImplementation(function () {
      this.add = mockGraphicsLayerAdd
    })

    mockGraphicConstructor.mockImplementation(function (args) {
      this.geometry = args.geometry
      this.symbol = args.symbol
    })

    mockGetOsToken.mockResolvedValue({ token: 'os-token-value' })
    mockGetEsriToken.mockResolvedValue({ token: 'esri-token-value' })
  })

  describe('product 4 submit button', () => {
    it('should disable the button when the form is submitted', () => {
      loadModule()
      const button = document.querySelector('.order-product-four')

      document.querySelector('form').dispatchEvent(new window.Event('submit'))

      expect(button.disabled).toBe(true)
    })

    it('should re-enable the button when the page is restored via pageshow', () => {
      loadModule()
      const button = document.querySelector('.order-product-four')
      document.querySelector('form').dispatchEvent(new window.Event('submit'))

      window.dispatchEvent(new window.Event('pageshow'))

      expect(button.disabled).toBe(false)
    })
  })

  describe('showMap', () => {
    const polygonArray = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]

    it('should configure the esri api key and OS maps token interceptor', async () => {
      const { showMap } = loadModule()

      await showMap(polygonArray)

      expect(mockGetEsriToken).toHaveBeenCalled()
      expect(mockEsriConfig.apiKey).toBe('esri-token-value')
      expect(mockEsriConfig.request.interceptors).toHaveLength(1)

      const interceptor = mockEsriConfig.request.interceptors[0]
      expect(interceptor.urls).toBe('https://api.os.uk/maps/raster/v1/wmts')

      const params = { requestOptions: {} }
      await interceptor.before(params)

      expect(mockGetOsToken).toHaveBeenCalled()
      expect(params.requestOptions.headers).toEqual({ Authorization: 'Bearer os-token-value' })
    })

    it('should build the base map layer, graphics layer and polygon graphic', async () => {
      const { showMap } = loadModule()

      await showMap(polygonArray)

      expect(mockWMTSLayerConstructor).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://api.os.uk/maps/raster/v1/wmts',
        serviceMode: 'KVP',
        activeLayer: { id: 'Outdoor_27700' }
      }))

      expect(mockGraphicsLayerConstructor).toHaveBeenCalled()
      expect(mockGraphicConstructor).toHaveBeenCalledWith(expect.objectContaining({
        geometry: expect.objectContaining({ type: 'polygon', rings: [polygonArray] })
      }))

      const graphicInstance = mockGraphicConstructor.mock.instances[0]
      expect(mockGraphicsLayerAdd).toHaveBeenCalledWith(graphicInstance)
      // symbol is reassigned to a thicker solid line after being added to the layer
      expect(graphicInstance.symbol).toEqual({
        type: 'simple-line',
        color: '#d4351c',
        width: '3px',
        style: 'solid'
      })

      expect(mockMapConstructor).toHaveBeenCalled()
    })

    it('should compute a small buffer around the bounding box for a small polygon', async () => {
      const { showMap } = loadModule()

      await showMap(polygonArray)

      const extentArgs = mockExtentConstructor.mock.calls[0][0]
      // width and height are both 10, so both fall into the '< threshold' buffer branch
      expect(extentArgs.xmax - extentArgs.xmin).toBeGreaterThan(10)
      expect(extentArgs.ymax - extentArgs.ymin).toBeGreaterThan(10)
      expect(mockPointConstructor).toHaveBeenCalledWith(expect.objectContaining({ spatialReference: 27700 }))
    })

    it('should use a fixed 10 unit buffer for a large polygon', async () => {
      const { showMap } = loadModule()
      const largePolygon = [[0, 0], [1000, 0], [1000, 1000], [0, 1000], [0, 0]]

      await showMap(largePolygon)

      const extentArgs = mockExtentConstructor.mock.calls[0][0]
      expect(extentArgs.xmin).toBe(-10)
      expect(extentArgs.ymin).toBe(-10)
      expect(extentArgs.xmax).toBe(1010)
      expect(extentArgs.ymax).toBe(1010)
    })

    it('should build the map view with the expected constraints and container', async () => {
      const { showMap } = loadModule()

      await showMap(polygonArray)

      expect(mockMapViewConstructor).toHaveBeenCalled()
      const viewArgs = mockMapViewConstructor.mock.calls[0][0]
      expect(viewArgs.container).toBe('map')
      expect(viewArgs.spatialReference).toBe(27700)
      expect(viewArgs.ui).toEqual({ components: [] })
      expect(viewArgs.navigation).toEqual({
        actionMap: { mouseWheel: 'none' },
        browserTouchPanEnabled: false
      })
      expect(viewArgs.constraints).toEqual(expect.objectContaining({
        snapToZoom: false,
        minZoom: 6,
        maxZoom: 20,
        lods: ['lod-mock'],
        rotationEnabled: false
      }))
    })

    it('should stop propagation for key-down and single/multi-modifier drag and double-click events', async () => {
      const { showMap } = loadModule()

      await showMap(polygonArray)

      const handlers = [
        findOnHandler('key-down'),
        findOnHandler('drag'),
        findOnHandler('drag', 1),
        findOnHandler('drag', 2),
        findOnHandler('double-click'),
        findOnHandler('double-click', 1)
      ]

      handlers.forEach((handler) => {
        const fakeEvent = { stopPropagation: jest.fn() }
        handler(fakeEvent)
        expect(fakeEvent.stopPropagation).toHaveBeenCalledTimes(1)
      })
    })

    it('should remove tabindex and role from the map surface once the layer view stops updating', async () => {
      const { showMap } = loadModule()

      const mapSurface = document.createElement('div')
      mapSurface.className = 'esri-view-surface'
      mapSurface.setAttribute('tabindex', '0')
      mapSurface.setAttribute('role', 'application')
      document.body.appendChild(mapSurface)

      const mockWatch = jest.fn()
      mockMapViewInstance.whenLayerView = jest.fn().mockResolvedValue({ watch: mockWatch })

      await showMap(polygonArray)
      // allow the whenLayerView promise chain to resolve
      await Promise.resolve()
      await Promise.resolve()

      expect(mockMapViewInstance.whenLayerView).toHaveBeenCalled()
      const watchCallback = mockWatch.mock.calls[0][1]

      watchCallback(true)
      expect(mapSurface.hasAttribute('tabindex')).toBe(true)

      watchCallback(false)
      expect(mapSurface.hasAttribute('tabindex')).toBe(false)
      expect(mapSurface.hasAttribute('role')).toBe(false)
    })

    it('should add a scale bar to the view', async () => {
      const { showMap } = loadModule()

      const view = await showMap(polygonArray)

      expect(mockScaleBarConstructor).toHaveBeenCalledWith(expect.objectContaining({ unit: 'metric', style: 'line' }))
      expect(view.ui.add).toHaveBeenCalledWith(
        mockScaleBarConstructor.mock.instances[0],
        { position: 'bottom-left' }
      )
      expect(view.ui.padding.bottom).toBe(2)
    })

    it('should expose showMap as a global for use from the rendered page', () => {
      loadModule()

      expect(typeof window.showMap).toBe('function')
    })
  })
})
