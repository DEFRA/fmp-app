const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { JSDOM } = require('jsdom')
const externalHealthCheck = require('../../server/services/external-health-check')
require('dotenv').config()

lab.experiment('About Page', () => {
  const options = { method: 'GET', url: '/about' }
  let server
  let restoreGetFmpServiceVersion
  let restoreGetFmpApiVersion

  lab.before(async () => {
    restoreGetFmpServiceVersion = externalHealthCheck.getFmpServiceVersion
    restoreGetFmpApiVersion = externalHealthCheck.getFmpApiVersion

    externalHealthCheck.getFmpServiceVersion = () => ({ version: 'v9.9.9', revision: '112233445566778899' })
    externalHealthCheck.getFmpApiVersion = () => ({ version: 'v8.8.8', revision: '998877665544332211' })
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    externalHealthCheck.getFmpServiceVersion = restoreGetFmpServiceVersion
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
    const fmpServiceVersion = doc.querySelectorAll('#fmp-service-version')
    const fmpServiceRevision = doc.querySelectorAll('#fmp-service-revision')
    const fmpApiVersion = doc.querySelectorAll('#fmp-api-version')
    const fmpApiRevision = doc.querySelectorAll('#fmp-api-revision')

    Code.expect(fmpAppVersion[0].textContent).to.contain('Version: v3.0.0-1')
    Code.expect(fmpAppRevision[0].textContent).to.contain('Revision: 9256171')
    Code.expect(fmpServiceVersion[0].textContent).to.contain('Version: v9.9.9')
    Code.expect(fmpServiceRevision[0].textContent).to.contain('Revision: 1122334')
    Code.expect(fmpApiVersion[0].textContent).to.contain('Version: v8.8.8')
    Code.expect(fmpApiRevision[0].textContent).to.contain('Revision: 9988776')
  })
})
