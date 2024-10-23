const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')
require('dotenv').config()

lab.experiment('privacy-notice', () => {
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  const assertPrivacyNoticePage = async (response) => {
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    await payloadMatchTest(payload, /<h1 class="govuk-heading-xl"> Privacy notice <\/h1>/g)
  }

  lab.test('privacy-notice', async () => {
    const options = {
      method: 'GET',
      url: '/privacy-notice'
    }

    const response = await server.inject(options)
    await assertPrivacyNoticePage(response)
  })
})
