const { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests } = require('./__mocks__/agol')
const createServer = require('../../../server')

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
    OBJECTID: 150663,
    origin: 'modelled and recorded',
    flood_zone: 'FZ3',
    asset_state: 'defended & undefended',
    flood_source: 'river',
    flood_source_and_state: 'river-undefended-modelled_river-defended-modelled_recorded',
    Shape__Area: 108075.19142150879,
    Shape__Length: 5098.461924182072
  }
}

describe('getFloodZonesByPolygon', () => {
  let server
  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
    stopMockingEsriRequests()
  })

  it('getFloodZonesByPolygon without polygon should throw "No Polygon provided"', async () => {
    try {
      const response = await server.methods.getFloodZonesByPolygon('')
      expect(response).toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('getFloodZonesByPolygon - No Polygon provided')
    }
  })

  it('getFloodZonesByPolygon should return data as expected for FZ3 only', async () => {
    mockEsriRequest([fz3Area, fz3Area])
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const response = await server.methods.getFloodZonesByPolygon(polygon)
    expect(response).toEqual({
      in_england: true,
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      reduction_in_rofrs: false,
      surface_water: false,
      extra_info: null
    })
  })

  it('getFloodZonesByPolygon should return data as expected for FZ2 only', async () => {
    mockEsriRequest([fz2Area, fz2Area]) // We send two areas so that early exit lines are covered
    const { method: getFloodZonesByPolygon } = require('../../../server/services/flood-zones-by-polygon')
    const response = await getFloodZonesByPolygon('[[123,456],[125,457],[125,456],[123,456]]')
    expect(response).toEqual({
      in_england: true,
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      reduction_in_rofrs: false,
      surface_water: false,
      extra_info: null
    })
  })

  it('getFloodZonesByPolygon should return data as expected for FZ2 and FZ3', async () => {
    mockEsriRequest([fz2Area, fz3Area, fz2Area, fz3Area]) // We send multiple areas so that early exit lines are covered
    const { method: getFloodZonesByPolygon } = require('../../../server/services/flood-zones-by-polygon')
    const response = await getFloodZonesByPolygon('[[123,456],[125,457],[125,456],[123,456]]')
    expect(response).toEqual({
      in_england: true,
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      reduction_in_rofrs: false,
      surface_water: false,
      extra_info: null
    })
  })

  it('getFloodZonesByPolygon should throw if ezriRequest throws"', async () => {
    try {
      mockEsriRequestWithThrow()
      const { method: getFloodZonesByPolygon } = require('../../../server/services/flood-zones-by-polygon')
      await getFloodZonesByPolygon('[[123,456],[125,457],[125,456],[123,456]]')
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      console.log(err)
      expect(err.message).toEqual('Fetching getFloodZonesByPolygon failed: ')
    }
  })
})
