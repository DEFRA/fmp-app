const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')

lab.experiment('maintenance', () => {
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  const assertmaintenancePage = async (response) => {
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    await payloadMatchTest(
      payload,
      /<h1 class="govuk-heading-l" tabindex="0">Sorry, the service is unavailable<\/h1>/g
    )
  }

  // The maintenance route was misspelled maintainence - we should honour either to avoid future problems
  const urls = ['/maintainence', '/maintenance']
  urls.forEach((url) => {
    lab.test(`${url} should serve the maintenance page`, async () => {
      const options = { method: 'GET', url }
      const response = await server.inject(options)
      await assertmaintenancePage(response)
    })
  })
})
