
const hapi = require('@hapi/hapi')
const config = require('../server/config')
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
// const createServer = require('../server')

lab.experiment('Missing resource test', () => {
  let server

  // Create server before the tests.
  // lab.before(async () => {
  //   server = await createServer()
  // })
  lab.before(async () => {
    // server = await createServer()
    server = await hapi.server({
      port: config.port,
      routes: {
        validate: {
          options: {
            abortEarly: false
          }
        }
      }
    })

    const routerPlugin = {
      plugin: {
        name: 'router',
        register: (server, options) => {
          server.route(require('../server/routes/home'))
        }
      }
    }
    await server.register(require('@hapi/inert'))
    await server.register(require('@hapi/h2o2'))
    await server.register(require('../server/plugins/views'))
    // await server.register(require('../server/plugins/router'))
    await server.register(routerPlugin)
    await server.register(require('../server/plugins/error-pages'))
    await server.register(require('../server/plugins/full-url'))
    // await server.register(require('../server/plugins/session'))
    await server.initialize()
  })

  // Stop server after the tests.
  lab.after(async () => {
    await server.stop()
  })

  lab.test('Missing resources are handled correctly', async () => {
    const options = {
      method: 'GET',
      url: '/missing/resource'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
})
