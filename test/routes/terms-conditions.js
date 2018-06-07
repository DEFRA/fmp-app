const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const { manifest, options } = require('../../server')

lab.experiment('terms-conditions', () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)
  })

  lab.test('terms-conditions', async () => {
    const options = {
      method: 'GET',
      url: '/terms-conditions'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })
})
