'use strict'

const Lab = require('@hapi/lab')
const Hapi = require('@hapi/hapi')
// const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
// const config = require('../../server/config')

lab.experiment('router logging test', () => {
  let sandbox
  let server

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    sandbox = await sinon.createSandbox()
    server = Hapi.server({
      port: 3000,
      host: 'localhost'
    })
    await server.register(require('@hapi/inert'))
    await server.register(require('@hapi/h2o2'))
    // await server.register(require('../../server/plugins/views'))
    // await server.register(require('../../server/plugins/router'))
    await server.register(require('../../server/plugins/logging'))
    await server.initialize()
  })

  lab.afterEach(async () => {
    await server.stop()
    await sandbox.restore()
  })

  lab.test('Plugin logging successfully loads', async () => {
  })
})
