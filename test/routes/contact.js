const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')

lab.experiment('privacy-policy', () => {
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

  lab.test('contact', async () => {
    const options = {
      method: 'GET',
      url: '/contact'
    }

    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('contact')
    Code.expect(response.statusCode).to.equal(200)
  })
})
