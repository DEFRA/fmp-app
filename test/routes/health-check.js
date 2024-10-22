const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const createServer = require('../../server')

lab.experiment('health-check', () => {
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  lab.test('health-check', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health-check'
    })
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    Code.expect(payload).to.equal('{"name":"fmp-app","version":"v3.0.0-1","revision":"925617123"}')
  })
})
