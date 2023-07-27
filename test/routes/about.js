const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const { JSDOM } = require('jsdom')
const mock = require('mock-require')

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
    await mock('../../package.json', {
      version: '2.4.0-pre.11',
      dataVersion: '2.2.4'
    })
    const { payload } = await server.inject(options)
    const { window: { document: doc } } = await new JSDOM(payload)
    const div = doc.querySelectorAll('#contact-page')
    Code.expect(div[0].textContent).to.contain('Release: 2.4.0')
    Code.expect(div[0].textContent).to.contain('Build number: 2.4.0-pre.11')
    Code.expect(div[0].textContent).to.contain('Data version: 2.2.4')
    await mock.stop('../../package.json')
  })

  lab.test('/about page should contain version numbers as expected for a release 2.4.0-11', async () => {
    await mock('../../package.json', {
      version: '2.4.0-11',
      dataVersion: '2.9'
    })
    const { payload } = await server.inject(options)
    const { window: { document: doc } } = await new JSDOM(payload)
    const div = doc.querySelectorAll('#contact-page')
    Code.expect(div[0].textContent).to.contain('Release: 2.4.0')
    Code.expect(div[0].textContent).to.contain('Build number: 2.4.0-11')
    Code.expect(div[0].textContent).to.contain('Data version: 2.9')
    await mock.stop('../../package.json')
  })
})
