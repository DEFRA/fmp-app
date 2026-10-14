const http = require('http')
const hapi = require('@hapi/hapi')

describe('proxy route', () => {
  let upstream

  beforeAll(async () => {
    upstream = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true, path: req.url }))
    })

    await new Promise((resolve) => upstream.listen(3005, 'localhost', resolve))
  })

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      upstream.close((err) => (err ? reject(err) : resolve()))
    })
  })

  it('proxies requests under /proxy to localhost:3005', async () => {
    const server = hapi.server({})
    await server.register(require('@hapi/h2o2'))
    server.route(require('../proxy'))

    const response = await server.inject({
      method: 'GET',
      url: '/proxy/example/path?foo=bar'
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({ ok: true, path: '/example/path?foo=bar' })
  })
})
