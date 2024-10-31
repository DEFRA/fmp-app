require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { mockEsriRequest, stopMockingEsriRequests } = require('./mocks/agol')

lab.experiment('is-england', () => {
  let server
  let isEnglandService

  lab.before(async () => {
    mockEsriRequest()
    // isEnglandService must be required AFTER esriRequest is mocked
    isEnglandService = require('../../server/services/is-england')
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
    stopMockingEsriRequests()
  })

  lab.test('is-england without easting or northing should throw "No point provided"', async () => {
    const point = {}
    try {
      await isEnglandService.get(point.easting, point.northing)
    } catch (err) {
      Code.expect(isEnglandService.get).to.throw(Error, 'No point provided')
    }
  })

  lab.test('is-england without easting should throw "No point provided"', async () => {
    const point = { northing: 388244 }
    try {
      await isEnglandService.get(point.easting, point.northing)
    } catch (err) {
      Code.expect(isEnglandService.get).to.throw(Error, 'No point provided')
    }
  })

  lab.test('is-england without northing should throw "No point provided"', async () => {
    const point = { easting: 388244 }
    try {
      await isEnglandService.get(point.easting, point.northing)
    } catch (err) {
      Code.expect(isEnglandService.get).to.throw(Error, 'No point provided')
    }
  })

  lab.test('is-england with northing and easting should call esriRequest"', async () => {
    const point = { northing: 388244, easting: 388244 }
    const response = await isEnglandService.get(point.easting, point.northing)
    Code.expect(response).to.equal({ is_england: true })
  })
})
