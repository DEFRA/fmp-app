const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')

lab.experiment('404', () => {
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  const assert404Page = async (response) => {
    const { payload } = response
    Code.expect(response.statusCode).to.equal(404)
    await payloadMatchTest(payload, /<h1 class="govuk-heading-xl">Page not found<\/h1>/g)
  }
  const urls = ['/home', '/jksdf', '/jksdf']
  urls.forEach(url => {
    lab.test(`${url} should serve the 404 page`, async () => {
      const options = { method: 'GET', url }
      const response = await server.inject(options)
      await assert404Page(response)
    })
  })
})
