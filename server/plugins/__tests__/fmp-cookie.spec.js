const Boom = require('@hapi/boom')
const hapi = require('@hapi/hapi')
const createServer = require('../../index')
const fmpCookie = require('../fmp-cookie')
const { extractTokenValue } = require('@defra/fmp-utilities/secureUtils')
const { createPublicKey, createPrivateKey } = require('node:crypto')

describe('fmp-cookie plugin', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    server.route({ method: 'GET', path: '/fmp-cookie-test', handler: () => 'ok' })
    server.route({ method: 'GET', path: '/fmp-cookie-test/response-404', handler: (_request, h) => h.response('not found').code(404) })
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const getPublicKey = () => {
    const pem = Buffer.from(process.env.proxyPrivateKey, 'base64').toString('utf8')
    const publicPem = createPublicKey(createPrivateKey(pem)).export({ type: 'spki', format: 'pem' })
    return Buffer.from(publicPem).toString('base64')
  }

  const getFmpCookie = (response) => {
    const setCookie = [].concat(response.headers['set-cookie'] || [])
    const cookie = setCookie.find(c => c.startsWith('fmp='))
    return cookie?.split(';')[0].substring('fmp='.length)
  }

  it('sets a signed fmp cookie containing the created timestamp', async () => {
    const before = Date.now()
    const response = await server.inject({ method: 'GET', url: '/fmp-cookie-test' })
    const token = getFmpCookie(response)
    expect(token).toBeDefined()
    const value = extractTokenValue(token, getPublicKey())
    expect(value.created).toBeGreaterThanOrEqual(before)
    expect(value.created).toBeLessThanOrEqual(Date.now())
  })

  it('does not set the cookie on 404 responses', async () => {
    const response = await server.inject({ method: 'GET', url: '/does-not-exist' })
    expect(response.statusCode).toBe(404)
    expect(getFmpCookie(response)).toBeUndefined()
  })

  // In the full server the error-pages plugin converts Boom errors to views before this plugin runs
  it.each([
    ['a 200 response', '/fmp-cookie-test', 200, true],
    ['a 404 response', '/fmp-cookie-test/response-404', 404, false],
    ['a 404 error page', '/does-not-exist', 404, false]
  ])('for %s (status %s) sets the cookie: %s', async (_description, url, expectedStatus, expectCookie) => {
    const response = await server.inject({ method: 'GET', url })
    expect(response.statusCode).toBe(expectedStatus)
    if (expectCookie) {
      expect(getFmpCookie(response)).toBeDefined()
    } else {
      expect(getFmpCookie(response)).toBeUndefined()
    }
  })
})

// Registered on its own so that Boom errors reach the plugin unconverted
describe('fmp-cookie plugin with Boom responses', () => {
  let server

  beforeAll(async () => {
    server = hapi.server()
    await server.register(fmpCookie)
    server.route({ method: 'GET', path: '/boom-404', handler: () => Boom.notFound() })
    server.route({ method: 'GET', path: '/boom-403', handler: () => Boom.forbidden() })
    server.route({ method: 'GET', path: '/boom-500', handler: () => Boom.badImplementation() })
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  const hasFmpCookie = (response) => [].concat(response.headers['set-cookie'] || []).some(c => c.startsWith('fmp='))

  it.each([
    ['/boom-404', 404, false],
    ['/boom-403', 403, true],
    ['/boom-500', 500, true]
  ])('for %s (status %s) sets the cookie: %s', async (url, expectedStatus, expectCookie) => {
    const response = await server.inject({ method: 'GET', url })
    expect(response.statusCode).toBe(expectedStatus)
    expect(hasFmpCookie(response)).toBe(expectCookie)
  })
})
