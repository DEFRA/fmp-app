const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
require('dotenv').config()

lab.experiment('os-terms', () => {
  let server

  lab.before(async () => {
    console.log('Creating server')
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    console.log('Stopping server')
    await server.stop()
  })

  lab.test('os-terms page returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/os-terms'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('Ordnance Survey terms and conditions')
    Code.expect(response.payload).to.not.include('100024198') // Old Os Number
    Code.expect(response.payload).to.include('AC0000807064') // New Os Number
  })
})
