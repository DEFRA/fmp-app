const createServer = require('../../index')
const { extractTokenValue } = require('@defra/fmp-utilities/secureUtils')
const { createPublicKey, createPrivateKey } = require('node:crypto')

describe('fmp-cookie plugin', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    server.route({ method: 'GET', path: '/fmp-cookie-test', handler: () => 'ok' })
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
})
