const createServer = require('../../../index')
const { extractTokenValue } = require('@defra/fmp-utilities/secureUtils')
const { createPublicKey, createPrivateKey } = require('node:crypto')

describe('/map/refresh', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
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
    return setCookie.find(c => c.startsWith('fmp='))
  }

  it('should return 204 with no content', async () => {
    const response = await server.inject({ method: 'GET', url: '/map/refresh' })
    expect(response.statusCode).toBe(204)
    expect(response.payload).toBe('')
  })

  it('should set a fresh signed fmp cookie on each request', async () => {
    const before = Date.now()
    const response = await server.inject({ method: 'GET', url: '/map/refresh' })
    const cookie = getFmpCookie(response)
    expect(cookie).toBeDefined()
    expect(cookie).toContain('Path=/proxy')

    const token = cookie.split(';')[0].substring('fmp='.length)
    const value = extractTokenValue(token, getPublicKey())
    expect(value.created).toBeGreaterThanOrEqual(before)
    expect(value.created).toBeLessThanOrEqual(Date.now())
  })
})
