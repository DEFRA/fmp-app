const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const { JSDOM } = require('jsdom')

lab.experiment('flood-zone-results-explained', () => {
  let server
  const baseUrl = '/flood-zone-results-explained'

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  const getDocument = async (zone) => {
    const url = zone ? `${baseUrl}?zone=${zone}` : baseUrl
    const options = { method: 'GET', url }
    const response = await server.inject(options)
    const { payload } = response
    const { window: { document: doc } } = await new JSDOM(payload)
    const documentBody = doc.querySelector('#flood-zone-results-explained > .govuk-grid-column-two-thirds')
    return { response, documentBody }
  }

  const zoneValues = [undefined, 'FZ1', 'FZ2', 'FZ2a', 'FZ3', 'FZ3a']
  zoneValues.forEach(async (zone) => {
    lab.test(`get flood-zone-results-explained should return a page - ${zone}`, async () => {
      const { response } = await getDocument(zone)
      Code.expect(response.statusCode).to.equal(200)
    })
  })
})
