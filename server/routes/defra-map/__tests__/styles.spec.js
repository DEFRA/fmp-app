const { submitGetRequest } = require('../../../__test-helpers__/server')

const allowedHost = 'flood-map-for-planning.service.gov.uk'
const otherAllowedHost = 'fmp2-prd-blue.aws.defra.cloud'
const fontsPath = '/proxy/os-vector-tiles/resources/fonts/{fontstack}/{range}.pbf'

// fmpProxyUrl is unset so that the origin is derived from the request headers
jest.mock('../../../../config', () => {
  const actual = jest.requireActual('../../../../config')
  return {
    ...actual,
    config: {
      ...actual.config,
      fmpProxyUrl: undefined,
      allowedOrigins: {
        'flood-map-for-planning.service.gov.uk': 'flood-map-for-planning.service.gov.uk',
        'fmp2-prd-blue.aws.defra.cloud': 'fmp2-prd-blue.aws.defra.cloud'
      }
    }
  }
})

const getJson = async (url, headers) => {
  const response = await submitGetRequest({ url, headers })
  expect(response.headers['content-type']).toMatch(/^application\/json/)
  return JSON.parse(response.payload)
}

const getGlyphs = async (headers, url = '/map/styles/master-map') => (await getJson(url, headers)).glyphs

describe('map style.json routes', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it.each([
    '/map/styles/black-and-white-map',
    '/map/styles/master-map',
    '/map/styles/master-map-dark'
  ])('%s uses the host header with the server protocol when no forwarded headers are present', async (url) => {
    expect(await getGlyphs({ host: allowedHost }, url)).toEqual(`http://${allowedHost}${fontsPath}`)
  })

  it('master-map also proxies _sprite', async () => {
    const json = await getJson('/map/styles/master-map', { host: allowedHost })
    expect(json._sprite).toEqual(`http://${allowedHost}/proxy/os-vector-tiles/resources/sprites/sprite`)
  })

  it('prefers x-forwarded-host and x-forwarded-proto', async () => {
    const glyphs = await getGlyphs({
      host: 'internal.local',
      'x-forwarded-host': allowedHost,
      'x-forwarded-proto': 'https'
    })
    expect(glyphs).toEqual(`https://${allowedHost}${fontsPath}`)
  })

  it('uses the first value of comma separated forwarded headers', async () => {
    const glyphs = await getGlyphs({
      'x-forwarded-host': `${otherAllowedHost}, ${allowedHost}`,
      'x-forwarded-proto': 'https, http'
    })
    expect(glyphs).toEqual(`https://${otherAllowedHost}${fontsPath}`)
  })

  it('allows http when forwarded protocol is http', async () => {
    const glyphs = await getGlyphs({ 'x-forwarded-host': allowedHost, 'x-forwarded-proto': 'http' })
    expect(glyphs).toEqual(`http://${allowedHost}${fontsPath}`)
  })

  it('falls back to https for an invalid forwarded protocol', async () => {
    const glyphs = await getGlyphs({ 'x-forwarded-host': allowedHost, 'x-forwarded-proto': 'javascript' })
    expect(glyphs).toEqual(`https://${allowedHost}${fontsPath}`)
  })

  it('does not use a host that is not an allowed origin', async () => {
    const glyphs = await getGlyphs({ 'x-forwarded-host': 'evil.example.com', 'x-forwarded-proto': 'https' })
    expect(glyphs).toEqual(`null${fontsPath}`)
  })

  it('does not treat Object prototype properties as allowed hosts', async () => {
    const glyphs = await getGlyphs({ 'x-forwarded-host': 'constructor' })
    expect(glyphs).toEqual(`null${fontsPath}`)
  })

  it('serves tiles for vts-tile.json using the derived origin', async () => {
    const json = await getJson('/map/styles/vts-tile.json', {
      'x-forwarded-host': allowedHost,
      'x-forwarded-proto': 'https'
    })
    expect(json.tiles[0]).toEqual(`https://${allowedHost}/proxy/os-vector-tiles/tile/{z}/{y}/{x}.pbf`)
  })

  it('caches per origin so a second origin is not served the first origin\'s urls', async () => {
    const headersFor = (host) => ({ 'x-forwarded-host': host, 'x-forwarded-proto': 'https' })
    const first = await getGlyphs(headersFor(allowedHost))
    const second = await getGlyphs(headersFor(otherAllowedHost))
    const firstAgain = await getGlyphs(headersFor(allowedHost))
    expect(first).toEqual(`https://${allowedHost}${fontsPath}`)
    expect(second).toEqual(`https://${otherAllowedHost}${fontsPath}`)
    expect(firstAgain).toEqual(first)
  })

  it.each([
    '/map/productFourStyles/black-and-white-map',
    '/map/productFourStyles/black-and-white-map.json'
  ])('%s returns json', async (url) => {
    expect((await getJson(url)).version).toBeDefined()
  })
})
