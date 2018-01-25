const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
let server

lab.experiment('robots.txt', async () => {
  lab.before(async () => {
    server = await require('../../')()
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
