require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const { getByPolygon } = require('../../server/services/risk')
const util = require('../../server/util')
const { config } = require('../../config')

lab.experiment('risk', () => {
  let restoreGetJson

  lab.before(async () => {
    restoreGetJson = util.getJson
    util.getJson = async (url) => url
  })

  lab.after(async () => {
    util.getJson = restoreGetJson
  })

  lab.test('getByPolygon without polygon should throw "No Polygon provided"', async () => {
    try {
      const response = await getByPolygon()
      Code.expect(response).to.equal('this line should not be reached')
    } catch (err) {
      Code.expect(err.message).to.equal('No Polygon provided')
    }
  })

  lab.test('getByPolygon with northing and easting should call util.getJson"', async () => {
    // Question - unless i am mistaken, calls to zones-by-polygon instigated by
    // fmp-app seem to pass in the polygon as a json object (as per the line below 'const polygon = ...')
    // however the fmp-service test code implies that polygon=[[400000, 600000]] is expected i.e an array of coordinates
    const polygon = '{"type": "Polygon", "coordinates": [[[123,456],[125,457],[125,456],[123,456]]]}'
    const response = await getByPolygon(polygon)
    Code.expect(response).to.equal(`${config.service}/zones-by-polygon?polygon=${polygon}`)
  })
})
