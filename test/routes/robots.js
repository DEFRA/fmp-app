const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
require('dotenv').config()

lab.experiment('robots.txt', () => {
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

  lab.test('FCRM-4376 robots.txt should not exist returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/robots.txt'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
    Code.expect(response.payload).to.include('Page not found')
  })
})
