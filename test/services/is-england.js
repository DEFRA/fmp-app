const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const isEnglandService = require('../../server/services/is-england')
const util = require('../../server/util')
const createServer = require('../../server')

lab.experiment('is-england', () => {
  let server
  let restoreGetJson

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
    restoreGetJson = util.getJson
    util.getJson = () => 'getJson was called'
  })

  lab.after(async () => {
    await server.stop()
    util.getJson = restoreGetJson
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

  lab.test('is-england with northing and easting should call util.getJson"', async () => {
    const point = { northing: 388244, easting: 388244 }
    const response = await isEnglandService.get(point.easting, point.northing)
    Code.expect(response).to.equal('getJson was called')
  })
})
