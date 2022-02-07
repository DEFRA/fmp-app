const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')

lab.experiment('cookies', () => {
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

  lab.test('cookies', async () => {
    const options = {
      method: 'GET',
      url: '/cookies'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })
})
