require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const util = require('../../server/util')
const { config } = require('../../config')

lab.experiment('getFloodZonesByPolygon', () => {
  let restoreGetJson
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
    restoreGetJson = util.getJson
    util.getJson = async (url) => url
  })

  lab.after(async () => {
    util.getJson = restoreGetJson
    await server.stop()
  })

  lab.test('getFloodZonesByPolygon without polygon should throw "No Polygon provided"', async () => {
    try {
      const response = await server.methods.getFloodZonesByPolygon('')
      Code.expect(response).to.equal('this line should not be reached')
    } catch (err) {
      Code.expect(err.message).to.equal('No Polygon provided')
    }
  })

  lab.test('getFloodZonesByPolygon with northing and easting should call util.getJson"', async () => {
    // Question - unless i am mistaken, calls to zones-by-polygon instigated by
    // fmp-app seem to pass in the polygon as a json object (as per the line below 'const polygon = ...')
    // however the fmp-service test code implies that polygon=[[400000, 600000]] is expected i.e an array of coordinates
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const expectedPolygonInUrl = `{"type": "Polygon", "coordinates": [${polygon}]}`
    const response = await server.methods.getFloodZonesByPolygon(polygon)
    Code.expect(response).to.equal(`${config.service}/flood-zones-by-polygon?polygon=${expectedPolygonInUrl}`)
  })
})
