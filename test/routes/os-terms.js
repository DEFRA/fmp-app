const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
let server

lab.experiment('os-terms', async () => {
  lab.before(async () => {
    server = await require('../../')()
  })
  lab.test('os-terms page returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/os-terms'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include('Ordnance Survey terms and conditions')
  })
})
