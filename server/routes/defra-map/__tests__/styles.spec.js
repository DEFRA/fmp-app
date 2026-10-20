const allowedHost = 'flood-map-for-planning.service.gov.uk'
const otherAllowedHost = 'fmp2-prd-blue.aws.defra.cloud'

const styleRoutes = [
  '/map/styles/black-and-white-map',
  '/map/styles/master-map',
  '/map/styles/master-map-dark'
]

// Each test uses a fresh server and module registry so the per-origin JSON cache is not shared
const startServer = async ({ fmpProxyUrl, allowedOrigins }) => {
  jest.resetModules()
  jest.doMock('../../../../config', () => {
    const actual = jest.requireActual('../../../../config')
    return {
      ...actual,
      config: {
        ...actual.config,
        fmpProxyUrl,
        allowedOrigins: allowedOrigins || { [allowedHost]: allowedHost, [otherAllowedHost]: otherAllowedHost }
      }
    }
  })
  const server = await require('../../../../server')()
  await server.initialize()
  return server
}

describe('map style.json routes', () => {
  let server

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await server?.stop()
    server = undefined
  })

  afterAll(() => {
    jest.dontMock('../../../../config')
  })

  describe('with fmpProxyUrl configured', () => {
    beforeEach(async () => {
      server = await startServer({ fmpProxyUrl: 'http://proxy.test' })
    })

    it.each(styleRoutes)('%s uses fmpProxyUrl for sprite and glyphs regardless of headers', async (url) => {
      const response = await server.inject({ method: 'GET', url, headers: { host: 'evil.example.com' } })
      expect(response.statusCode).toBe(200)
      const json = JSON.parse(response.payload)
      expect(json.glyphs).toEqual('http://proxy.test/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf')
      if (url === '/map/styles/master-map') {
        expect(json._sprite).toEqual('http://proxy.test/os-vector-tiles/resources/sprites/sprite')
      }
    })

    it('vts-tile.json uses fmpProxyUrl for tiles', async () => {
      const response = await server.inject({ method: 'GET', url: '/map/styles/vts-tile.json' })
      expect(response.statusCode).toBe(200)
      const result = JSON.parse(response.payload)
      expect(result.tiles[0]).toEqual('http://proxy.test/os-vector-tiles/tile/{z}/{y}/{x}.pbf')
    })
  })

  describe('without fmpProxyUrl (origin derived from request headers)', () => {
    beforeEach(async () => {
      server = await startServer({ fmpProxyUrl: undefined })
    })

    const getGlyphs = async (headers, url = '/map/styles/master-map') => {
      const response = await server.inject({ method: 'GET', url, headers })
      expect(response.statusCode).toBe(200)
      return JSON.parse(response.payload).glyphs
    }

    it('uses the host header with the server protocol when no forwarded headers are present', async () => {
      expect(await getGlyphs({ host: allowedHost })).toEqual(`http://${allowedHost}/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf`)
    })

    it('prefers x-forwarded-host and x-forwarded-proto', async () => {
      const glyphs = await getGlyphs({
        host: 'internal.local',
        'x-forwarded-host': allowedHost,
        'x-forwarded-proto': 'https'
      })
      expect(glyphs).toEqual(`https://${allowedHost}/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf`)
    })

    it('uses the first value of comma separated forwarded headers', async () => {
      const glyphs = await getGlyphs({
        'x-forwarded-host': `${otherAllowedHost}, ${allowedHost}`,
        'x-forwarded-proto': 'https, http'
      })
      expect(glyphs).toEqual(`https://${otherAllowedHost}/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf`)
    })

    it('allows http when forwarded protocol is http', async () => {
      const glyphs = await getGlyphs({ 'x-forwarded-host': allowedHost, 'x-forwarded-proto': 'http' })
      expect(glyphs).toEqual(`http://${allowedHost}/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf`)
    })

    it('falls back to https for an invalid forwarded protocol', async () => {
      const glyphs = await getGlyphs({ 'x-forwarded-host': allowedHost, 'x-forwarded-proto': 'javascript' })
      expect(glyphs).toEqual(`https://${allowedHost}/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf`)
    })

    it('does not use a host that is not an allowed origin', async () => {
      const glyphs = await getGlyphs({ 'x-forwarded-host': 'evil.example.com', 'x-forwarded-proto': 'https' })
      expect(glyphs).not.toContain('evil.example.com')
      expect(glyphs).toEqual('null/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf')
    })

    it('does not treat Object prototype properties as allowed hosts', async () => {
      const glyphs = await getGlyphs({ 'x-forwarded-host': 'constructor' })
      expect(glyphs).toEqual('null/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf')
    })

    it('serves tiles for vts-tile.json using the derived origin', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/map/styles/vts-tile.json',
        headers: { 'x-forwarded-host': allowedHost, 'x-forwarded-proto': 'https' }
      })
      expect(JSON.parse(response.payload).tiles[0]).toBe(
        `https://${allowedHost}/proxy/os-vector-tiles/tile/{z}/{y}/{x}.pbf`
      )
    })

    it('caches per origin so a second origin is not served the first origin\'s urls', async () => {
      const first = await getGlyphs({ 'x-forwarded-host': allowedHost, 'x-forwarded-proto': 'https' })
      const second = await getGlyphs({ 'x-forwarded-host': otherAllowedHost, 'x-forwarded-proto': 'https' })
      const firstAgain = await getGlyphs({ 'x-forwarded-host': allowedHost, 'x-forwarded-proto': 'https' })
      expect(first).toContain(allowedHost)
      expect(second).toContain(otherAllowedHost)
      expect(firstAgain).toBe(first)
    })
  })

  describe('static P4 routes', () => {
    beforeEach(async () => {
      server = await startServer({ fmpProxyUrl: 'http://proxy.test' })
    })

    it.each([
      '/map/productFourStyles/black-and-white-map',
      '/map/productFourStyles/black-and-white-map.json'
    ])('%s returns json', async (url) => {
      const response = await server.inject({ method: 'GET', url })
      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload).version).toBeDefined()
    })
  })
})
