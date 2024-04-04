const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')

lab.experiment('order-not-submitted', () => {
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  lab.test('order-not-submitted should serve the order-not-submitted page', async () => {
    const options = {
      method: 'GET',
      url: '/order-not-submitted?polygon=[[480201,483895],[480194,483871],[480209,483869],[480201,483895]]&center=[480208,483882]&location=pickering'
    }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })
})
