'use strict'

const Hapi = require('@hapi/hapi')
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const sinon = require('sinon')
const lab = exports.lab = Lab.script()

lab.experiment('Get Routes test', () => {
  let sandbox
  let server

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    sandbox = await sinon.createSandbox()
    server = Hapi.server({
      port: 3009,
      host: 'localhost'
    })

    // await server.register(require('@hapi/inert'))
    // await server.register(require('@hapi/h2o2'))
    // await server.register(require('../../server/plugins/views'))
    // await server.register(require('../../server/plugins/router'))
    // await server.initialize()
  })

  lab.afterEach(async () => {
    await server.stop()
    await sandbox.restore()
  })

  lab.test('GET /start-page', async () => {
    const plugin = {
      plugin: {
        name: 'start-page',
        register: (server, options) => {
          server.route(require('../../server/routes/start-page'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/start-page'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('Check if a location in England is at risk of flooding now')
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
  lab.test('GET /location-not-england', async () => {
    const plugin = {
      plugin: {
        name: 'location-not-england',
        register: (server, options) => {
          server.route(require('../../server/routes/location-not-england'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/location-not-england'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('This service provides flood warning information for England only')
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
  lab.test('GET /sms-auto-opt-in-info', async () => {
    const plugin = {
      plugin: {
        name: 'sms-auto-opt-in-info',
        register: (server, options) => {
          server.route(require('../../server/routes/sms-auto-opt-in-info'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/sms-auto-opt-in-info'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('This phone number has been automatically opted-in to receive flood warnings')
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
  lab.test('GET /what-to-do-in-a-flood', async () => {
    const plugin = {
      plugin: {
        name: 'what-to-do-in-a-flood',
        register: (server, options) => {
          server.route(require('../../server/routes/what-to-do-in-a-flood'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/what-to-do-in-a-flood'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('What the flood warnings mean')
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
  lab.test('GET /plan-ahead-for-flooding', async () => {
    const plugin = {
      plugin: {
        name: 'plan-ahead-for-flooding',
        register: (server, options) => {
          server.route(require('../../server/routes/plan-ahead-for-flooding'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/plan-ahead-for-flooding'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('How to plan ahead for flooding')
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
  lab.test('GET /what-happens-after-a-flood', async () => {
    const plugin = {
      plugin: {
        name: 'what-happens-after-a-flood',
        register: (server, options) => {
          server.route(require('../../server/routes/what-happens-after-a-flood'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/what-happens-after-a-flood'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('What happens after a flood')
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
  lab.test('GET /recovering-after-a-flood', async () => {
    const plugin = {
      plugin: {
        name: 'recovering-after-a-flood',
        register: (server, options) => {
          server.route(require('../../server/routes/recovering-after-a-flood'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/recovering-after-a-flood'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('How to recover after a flood')
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
  lab.test('GET /', async () => {
    const plugin = {
      plugin: {
        name: 'home',
        register: (server, options) => {
          server.route(require('../../server/routes/home'))
        }
      }
    }

    await server.register(require('../../server/plugins/views'))
    await server.register(plugin)
    await server.initialize()

    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['content-type']).to.include('text/html')
  })
})
