const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const { manifest, options } = require('../../server')

lab.experiment('cookies', () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)
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
