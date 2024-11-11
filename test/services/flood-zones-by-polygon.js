require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests } = require('./mocks/agol')
const createServer = require('../../server')

lab.experiment('getFloodZonesByPolygon', () => {
  let server

  const fz2Area = {
    attributes: {
      OBJECTID: 150662,
      origin: 'modelled and recorded',
      flood_zone: 'FZ2',
      asset_state: 'defended & undefended',
      flood_source: 'river',
      flood_source_and_state: 'river-undefended-modelled_river-defended-modelled_recorded',
      Shape__Area: 108075.19142150879,
      Shape__Length: 5098.461924182072
    }
  }
  const fz3Area = {
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
  }

  lab.before(async () => {
    mockEsriRequest([fz3Area, fz3Area]) // We send two areas so that early exit lines are covered
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

  lab.test('getFloodZonesByPolygon should return data as expected for FZ3 only', async () => {
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

  lab.test('getFloodZonesByPolygon should return data as expected for FZ2 only', async () => {
    mockEsriRequest([fz2Area, fz2Area]) // We send two areas so that early exit lines are covered
    const { method: getFloodZonesByPolygon } = require('../../server/services/flood-zones-by-polygon')
    const response = await await getFloodZonesByPolygon('[[123,456],[125,457],[125,456],[123,456]]')
    Code.expect(response).to.equal({
      in_england: true,
      floodzone_2: true,
      floodzone_3: false,
      reduction_in_rofrs: false,
      surface_water: false,
      extra_info: null
    })
  })

  lab.test('getFloodZonesByPolygon should return data as expected for FZ2 and FZ3', async () => {
    mockEsriRequest([fz2Area, fz3Area, fz2Area, fz3Area]) // We send multiple areas so that early exit lines are covered
    const { method: getFloodZonesByPolygon } = require('../../server/services/flood-zones-by-polygon')
    const response = await await getFloodZonesByPolygon('[[123,456],[125,457],[125,456],[123,456]]')
    Code.expect(response).to.equal({
      in_england: true,
      floodzone_2: true,
      floodzone_3: true,
      reduction_in_rofrs: false,
      surface_water: false,
      extra_info: null
    })
  })

  lab.test('getFloodZonesByPolygon should throw if ezreiRequest throws"', async () => {
    try {
      mockEsriRequestWithThrow()
      const { method: getFloodZonesByPolygon } = require('../../server/services/flood-zones-by-polygon')
      await getFloodZonesByPolygon('[[123,456],[125,457],[125,456],[123,456]]')
      Code.expect('').to.equal('this line should not be reached')
    } catch (err) {
      Code.expect(err.message).to.equal('Fetching getFloodZonesByPolygon failed: ')
    }
  })
})
