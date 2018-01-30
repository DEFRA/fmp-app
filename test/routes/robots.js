const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const { manifest, options } = require('../../server')

lab.experiment('robots.txt', async () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)
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
