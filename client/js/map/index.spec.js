const mockGetDefraMapConfig = jest.fn()
const mockSetupEsriConfig = jest.fn()
jest.mock('./mapConfig.js', () => ({
  setupEsriConfig: (...args) => mockSetupEsriConfig(...args),
  getDefraMapConfig: (...args) => mockGetDefraMapConfig(...args)
}))

const mockSiteBoundary = { buffedExtents: null }
jest.mock('./interactive-map-helpers/siteBoundary.js', () => ({
  siteBoundary: mockSiteBoundary
}))

const mockMapState = { attach: jest.fn(), defraMapConfig: null }
jest.mock('./interactive-map-helpers/mapState.js', () => ({
  mapState: mockMapState
}))

const mockInitialisePlugins = jest.fn()
const mockAttachInteractiveMapToPlugins = jest.fn()
jest.mock('./plugins/initialisePlugins.js', () => ({
  initialisePlugins: (...args) => mockInitialisePlugins(...args),
  attachInteractiveMapToPlugins: (...args) => mockAttachInteractiveMapToPlugins(...args)
}))

// Shared @defra/interactive-map mocks - see client/js/__test-helpers__/interactiveMapMocks.js
const mockInteractiveMapMocks = require('../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map', () => mockInteractiveMapMocks.interactiveMap)
// virtual mock: this subpath has no CJS "require" export condition in the package
jest.mock('@defra/interactive-map/providers/esri', () => mockInteractiveMapMocks.esriProvider, { virtual: true })

const mockInteractiveMapInstance = { on: jest.fn(), addButton: jest.fn() }
const mockInteractiveMapConstructor = mockInteractiveMapMocks.interactiveMap.default
const mockEsriProvider = mockInteractiveMapMocks.esriProvider.default

const flushPromises = () => new Promise((resolve) => process.nextTick(resolve))

const loadModule = () => {
  jest.resetModules()
  require('./index.js')
  return flushPromises()
}

describe('map index', () => {
  beforeEach(() => {
    mockSiteBoundary.buffedExtents = null
    mockGetDefraMapConfig.mockResolvedValue({ someConfig: true })
    mockInitialisePlugins.mockReturnValue(['plugin-a'])
    mockInteractiveMapConstructor.mockImplementation(function () {
      return mockInteractiveMapInstance
    })
  })

  it('should build the interactive map with the default England extent when there is no boundary', async () => {
    await loadModule()

    expect(mockInteractiveMapConstructor).toHaveBeenCalledWith('map', expect.objectContaining({
      extent: [50000, 40000, 400000, 650000],
      place: 'England',
      minZoom: 6,
      maxZoom: 20
    }))
  })

  it('should use the site boundary buffed extents when available', async () => {
    mockSiteBoundary.buffedExtents = [1, 2, 3, 4]

    await loadModule()

    expect(mockInteractiveMapConstructor).toHaveBeenCalledWith('map', expect.objectContaining({
      extent: [1, 2, 3, 4]
    }))
  })

  it('should initialise plugins with the resolved defra map config and pass them to the interactive map', async () => {
    const defraMapConfig = { some: 'config' }
    mockGetDefraMapConfig.mockResolvedValue(defraMapConfig)

    await loadModule()

    expect(mockInitialisePlugins).toHaveBeenCalledWith(defraMapConfig)
    expect(mockMapState.defraMapConfig).toBe(defraMapConfig)
    expect(mockInteractiveMapConstructor).toHaveBeenCalledWith('map', expect.objectContaining({
      plugins: ['plugin-a']
    }))
  })

  it('should attach the interactive map to mapState and the plugins', async () => {
    await loadModule()

    expect(mockMapState.attach).toHaveBeenCalledWith(mockInteractiveMapInstance)
    expect(mockAttachInteractiveMapToPlugins).toHaveBeenCalledWith(mockInteractiveMapInstance)
  })

  it('should add a help button once the interactive map reports it is ready', async () => {
    await loadModule()

    const readyHandler = mockInteractiveMapInstance.on.mock.calls.find(([name]) => name === 'app:ready')[1]
    readyHandler()

    expect(mockInteractiveMapInstance.addButton).toHaveBeenCalledWith('help', expect.objectContaining({
      label: 'Help',
      href: '/map-help'
    }))
  })

  it('should configure the esri provider with the setupEsriConfig helper', async () => {
    await loadModule()

    const providerArgs = mockEsriProvider.mock.calls[0][0]
    expect(typeof providerArgs.setupConfig).toBe('function')

    providerArgs.setupConfig('some-config')
    expect(mockSetupEsriConfig).toHaveBeenCalledWith('some-config')
  })
})
