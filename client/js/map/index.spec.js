const flushPromises = () => new Promise(resolve => setImmediate(resolve))

const loadModule = (FmpMap) => {
  jest.resetModules()
  jest.doMock('@defra/fmp-map', () => ({ FmpMap }), { virtual: true })
  return require('./index')
}

const buildFmpMap = (initialise) => {
  const FmpMap = jest.fn()
  FmpMap.initialise = jest.fn(initialise)
  FmpMap.createPlugins = jest.fn().mockReturnValue(['plugin-a'])
  return FmpMap
}

describe('client/js/map/index', () => {
  it('throws when FmpMap is not available', () => {
    expect(() => loadModule(undefined)).toThrow('FmpMap is not available on the window object')
  })

  it('does not create the map until initialise resolves', async () => {
    let resolveInit
    const FmpMap = buildFmpMap(() => new Promise(resolve => { resolveInit = resolve }))

    loadModule(FmpMap)
    await flushPromises()

    expect(FmpMap.initialise).toHaveBeenCalledTimes(1)
    expect(FmpMap).not.toHaveBeenCalled()

    resolveInit()
    await flushPromises()

    expect(FmpMap).toHaveBeenCalledTimes(1)
  })

  it('creates the map with the England config once initialised', async () => {
    const FmpMap = buildFmpMap(() => Promise.resolve())

    loadModule(FmpMap)
    await flushPromises()

    expect(FmpMap.createPlugins).toHaveBeenCalledTimes(1)
    expect(FmpMap).toHaveBeenCalledWith({
      behaviour: 'inline',
      place: 'England',
      minZoom: 6,
      maxZoom: 20,
      extent: [50000, 40000, 400000, 650000],
      containerHeight: '100%',
      enableMapControls: false,
      enableZoomControls: true,
      plugins: ['plugin-a']
    })
  })
})
