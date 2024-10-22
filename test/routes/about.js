const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { JSDOM } = require('jsdom')
// const mock = require('mock-require')
require('dotenv').config()

lab.experiment('About Page', () => {
  const options = { method: 'GET', url: '/about' }
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  lab.test('/about page should exist', async () => {
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('/about page should contain version numbers as expected for a pre release 2.4.0-pre.11', async () => {
    const { payload } = await server.inject(options)
    const { window: { document: doc } } = await new JSDOM(payload)
    const fmpAppVersion = doc.querySelectorAll('#fmp-app-version')
    const fmpAppRevision = doc.querySelectorAll('#fmp-app-revision')
    Code.expect(fmpAppVersion[0].textContent).to.contain('Version: v3.0.0-1')
    Code.expect(fmpAppRevision[0].textContent).to.contain('Revision: 925617123')
  })
})
