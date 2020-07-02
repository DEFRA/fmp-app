'use strict'

const Lab = require('@hapi/lab')
const Hapi = require('@hapi/hapi')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

lab.experiment('router plugin test', () => {
  let sandbox
  let server

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    sandbox = await sinon.createSandbox()
    server = Hapi.server({
      port: 3000,
      host: 'localhost'
    })
    await server.initialize()
  })

  lab.afterEach(async () => {
    const regex = /.\/server\/services\/./
    Object.keys(require.cache).forEach((key) => {
      if (key.match(regex)) {
        delete require.cache[key]
      }
    })
    await server.stop()
    await sandbox.restore()
  })

  lab.test('Plugin router successfully loads', async () => {
  })
})
