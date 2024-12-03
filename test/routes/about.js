require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { JSDOM } = require('jsdom')
const externalHealthCheck = require('../../server/services/external-health-check')

lab.experiment('About Page', () => {
  const options = { method: 'GET', url: '/about' }
  let server
  let restoreGetFmpApiVersion

  lab.before(async () => {
    restoreGetFmpApiVersion = externalHealthCheck.getFmpApiVersion

    externalHealthCheck.getFmpApiVersion = () => ({ version: 'v8.8.8', revision: '998877665544332211' })
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    externalHealthCheck.getFmpApiVersion = restoreGetFmpApiVersion
    await server.stop()
  })

  lab.test('/about page should exist', async () => {
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('/about page should contain version numbers as expected', async () => {
    const { payload } = await server.inject(options)
    const { window: { document: doc } } = await new JSDOM(payload)
    const fmpAppVersion = doc.querySelectorAll('#fmp-app-version')
    const fmpAppRevision = doc.querySelectorAll('#fmp-app-revision')
    const fmpApiVersion = doc.querySelectorAll('#fmp-api-version')
    const fmpApiRevision = doc.querySelectorAll('#fmp-api-revision')

    Code.expect(fmpAppVersion[0].textContent).to.contain('Version: v3.0.0-1')
    Code.expect(fmpAppRevision[0].textContent).to.contain('Revision: 9256171')
    Code.expect(fmpApiVersion[0].textContent).to.contain('Version: v8.8.8')
    Code.expect(fmpApiRevision[0].textContent).to.contain('Revision: 9988776')
  })
})
