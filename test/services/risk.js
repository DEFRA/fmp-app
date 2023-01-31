const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const { getByPoint, getByPolygon } = require('../../server/services/risk')
const util = require('../../server/util')
const config = require('../../config')

lab.experiment('risk', () => {
  let restoreGetJson

  lab.before(async () => {
    restoreGetJson = util.getJson
    util.getJson = (url) => url
  })

  lab.after(async () => {
    util.getJson = restoreGetJson
  })

  lab.test('getByPoint without easting or northing should throw "No Point provided"', async () => {
    const point = {}
    try {
      await getByPoint(point.easting, point.northing)
    } catch (err) {
      Code.expect(getByPoint).to.throw(Error, 'No Point provided')
    }
  })

  lab.test('getByPoint without easting should throw "No Point provided"', async () => {
    const point = { northing: 388244 }
    try {
      await getByPoint(point.easting, point.northing)
    } catch (err) {
      Code.expect(getByPoint).to.throw(Error, 'No Point provided')
    }
  })

  lab.test('getByPoint without northing should throw "No Point provided"', async () => {
    const point = { easting: 388244 }
    try {
      await getByPoint(point.easting, point.northing)
    } catch (err) {
      Code.expect(getByPoint).to.throw(Error, 'No Point provided')
    }
  })

  lab.test('getByPoint with northing and easting should call util.getJson"', async () => {
    const point = { easting: 123456, northing: 78910 }
    const response = await getByPoint(point.easting, point.northing)
    Code.expect(response).to.equal(`${config.service}/zones/123456/78910/1`)
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

  lab.test('getByPolygon with a polygon of zero area should call getByPoint', async () => {
    // FCRM-3961 - if a call is made to getByPolygon and the polygon has no area (ie the user clicked the same spot 4 times)
    // then the postgres call fails. To mitigate this, we should treat the polygon as a point in these circumstances.
    const polygon = '{"type": "Polygon", "coordinates": [[[479826,484054],[479826,484054],[479826,484054],[479826,484054]]]}'
    const response = await getByPolygon(polygon)
    Code.expect(response).to.equal(`${config.service}/zones/479826/484054/1`)
  })
})
