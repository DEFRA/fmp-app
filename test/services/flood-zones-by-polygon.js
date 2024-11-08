require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const { mockEsriRequest, stopMockingEsriRequests } = require('./mocks/agol')
const createServer = require('../../server')

lab.experiment('getFloodZonesByPolygon', () => {
  let server

  lab.before(async () => {
    mockEsriRequest([{
      attributes: {
        OBJECTID: 150662,
        origin: 'modelled and recorded',
        flood_zone: 'FZ3',
        asset_state: 'defended & undefended',
        flood_source: 'river',
        flood_source_and_state: 'river-undefended-modelled_river-defended-modelled_recorded',
        Shape__Area: 108075.19142150879,
        Shape__Length: 5098.461924182072
      }
    }])
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
    stopMockingEsriRequests()
  })

  lab.test('getFloodZonesByPolygon without polygon should throw "No Polygon provided"', async () => {
    try {
      const response = await server.methods.getFloodZonesByPolygon('')
      Code.expect(response).to.equal('this line should not be reached')
    } catch (err) {
      Code.expect(err.message).to.equal('getFloodZonesByPolygon - No Polygon provided')
    }
  })

  lab.test('getFloodZonesByPolygon should return data as expected', async () => {
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const response = await server.methods.getFloodZonesByPolygon(polygon)
    Code.expect(response).to.equal({
      in_england: true,
      floodzone_2: false,
      floodzone_3: true,
      reduction_in_rofrs: false,
      surface_water: false,
      extra_info: null
    })
  })
})
