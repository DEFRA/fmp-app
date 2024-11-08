require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const { mockEsriRequest, stopMockingEsriRequests } = require('./mocks/agol')
const createServer = require('../../server')

lab.experiment('getContacts', () => {
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

  const errorsToTest = [
    ['false', false],
    ['a non array', 'not-array']
  ]
  errorsToTest.forEach(([titleText, returnValue]) => {
    lab.test(`if esriRequest returns ${titleText} expect an error`, async () => {
      mockEsriRequest(returnValue)
      const { getContacts } = require('../../server/services/agol/getContacts')
      try {
        await getContacts({ geometryType: 'esriGeometryPolygon', polygon: [[1, 2], [3, 4]] })
      } catch (error) {
        Code.expect(error.message).to.equal('Invalid response from AGOL customerTeam request')
      }
    })
  })
})
