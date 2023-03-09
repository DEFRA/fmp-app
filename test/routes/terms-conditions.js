const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')

lab.experiment('terms-and-conditions', () => {
  let server

  lab.before(async () => {
    console.log('Creating server')
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    console.log('Stopping server')
    await server.stop()
  })

  lab.test('terms-conditions', async () => {
    const options = {
      method: 'GET',
      url: '/terms-and-conditions'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    // This should not exist (FCRM-3669)
    await payloadMatchTest(payload, /<h2 class="heading-medium">Linking to the flood information service<\/h2>/g, 0)
    // It shpuld now be this
    await payloadMatchTest(payload, /<h2 class="govuk-heading-m">Linking to the flood map for planning service<\/h2>/g, 1)
  })
})
