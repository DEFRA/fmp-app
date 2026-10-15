const routes = require('../styles/index')

describe('map style.json routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should replace FMP proxy placeholders in map glyphs and vector tiles', () => {
    const vtsRoute = routes.generateVtsTileRoute('/map/styles/vts-tile.json', { tiles: ['FMP_PROXY/os-vector-tiles/tile/{z}/{y}/{x}.pbf'] })
    const vtsResponse = vtsRoute.handler()
    expect(vtsResponse.tiles[0]).toContain('http://localhost:3005/os-vector-tiles/tile')
    expect(vtsResponse.tiles[0]).not.toContain('FMP_PROXY')

    const stylesRoute = routes.generateStylesRoute('/map/styles/black-and-white-map', {
      _sprite: 'FMP_PROXY/os-vector-tiles/resources/sprites/sprite',
      glyphs: 'FMP_PROXY/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf'
    })
    const stylesResponse = stylesRoute.handler()
    expect(stylesResponse.sprite).toContain('http://localhost:3005/os-vector-tiles/resources/sprites/sprite')
    expect(stylesResponse.glyphs).toContain('http://localhost:3005/os-vector-tiles/resources/fonts')
    expect(stylesResponse.sprite).not.toContain('FMP_PROXY')
    expect(stylesResponse.glyphs).not.toContain('FMP_PROXY')
  })

  // it('should leave values unchanged when no FMP_PROXY placeholder is present', () => {
  //   const vtsRoute = routes.generateVtsTileRoute('/map/styles/vts-tile.json', { tiles: ['https://example.com/os-vector-tiles/tile/{z}/{y}/{x}.pbf'] })
  //   const vtsResponse = vtsRoute.handler()
  //   expect(vtsResponse.tiles[0]).toBe('https://example.com/os-vector-tiles/tile/{z}/{y}/{x}.pbf')

  //   const stylesRoute = routes.generateStylesRoute('/map/styles/black-and-white-map', {
  //     sprite: 'https://example.com/os-vector-tiles/resources/sprites/sprite',
  //     glyphs: 'https://example.com/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf'
  //   })
  //   const stylesResponse = stylesRoute.handler()
  //   expect(stylesResponse.sprite).toBe('https://example.com/os-vector-tiles/resources/sprites/sprite')
  //   expect(stylesResponse.glyphs).toBe('https://example.com/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf')
  // })

  it('should cope if sprite or glyphs are missing', () => {
    const stylesRoute = routes.generateStylesRoute('/map/styles/black-and-white-map', {})
    const stylesResponse = stylesRoute.handler()
    expect(stylesResponse.sprite).toBeUndefined()
    expect(stylesResponse.glyphs).toBeUndefined()
  })

  it('should cope if tiles are missing', () => {
    const vtsRoute = routes.generateVtsTileRoute('/map/styles/vts-tile.json', {})
    const vtsResponse = vtsRoute.handler()
    expect(vtsResponse.tiles).toBeUndefined()
  })

  const paths = [
    '/map/styles/vts-tile.json',
    '/map/styles/black-and-white-map',
    '/map/productFourStyles/black-and-white-map',
    '/map/productFourStyles/black-and-white-map.json',
    '/map/styles/master-map',
    '/map/styles/master-map-dark',
  ]

  paths.forEach((path) => {
    it(`should serve ${path}`, async () => {
      const mapStylesRoute = routes.find((route) => route.path === path)
      expect(mapStylesRoute).toBeDefined()
      const response = await mapStylesRoute.handler()
      expect(response).toBeDefined()
      // response is already a parsed JSON object, not a string
      expect(() => JSON.stringify(response)).not.toThrow()
    })
  })
})
