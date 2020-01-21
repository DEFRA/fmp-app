const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const { manifest, options } = require('../../server')

lab.experiment('contact', () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)
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
