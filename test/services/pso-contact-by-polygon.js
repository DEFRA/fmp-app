require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const psoContactByPolygonExport = require('../../server/services/pso-contact-by-polygon')
const { mockEsriRequest, stopMockingEsriRequests } = require('./mocks/agol')
const createServer = require('../../server')

lab.experiment('pso-contact-by-polygon', () => {
  let server

  lab.before(async () => {
    mockEsriRequest()
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
    stopMockingEsriRequests()
  })

  lab.test('pso-contact-by-polygon generateKey', async () => {
    const { generateKey } = psoContactByPolygonExport.options
    const key = generateKey([[1, 2], [3, 4]])
    Code.expect(key).to.equal('[[1,2],[3,4]]')
    Code.expect(key).to.equal('[[1,2],[3,4]]')
  })

  lab.test('pso-contact-by-polygon getPsoContactsByPolygon should throw if invalid result returned', async () => {
    const assertions = Code.count()
    const getPsoContactsByPolygon = psoContactByPolygonExport.method
    try {
      mockEsriRequest('invalid response')
      await getPsoContactsByPolygon([[1, 2], [3, 4]])
    } catch (err) {
      Code.expect(err.message).to.equal('Fetching Pso contacts by polygon failed: ')
    }
    // Now ensure the assertion was actually made
    Code.expect(Code.count() - assertions).to.equal(1)
  })
})
