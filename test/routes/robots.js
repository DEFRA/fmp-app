const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')

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

  lab.test('robots.txt returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/robots.txt'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('User-agent: *\nDisallow: /\n')
  })
})
