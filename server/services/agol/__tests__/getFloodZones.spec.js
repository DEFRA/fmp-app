const { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests } = require('../../../services/__tests__/__mocks__/agol')
const { getFloodZones } = require('../getFloodZones')

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

describe('getFloodZones', () => {
  afterAll(async () => {
    stopMockingEsriRequests()
  })

  it('getFloodZones should return data as expected for FZ3 only', async () => {
    mockEsriRequest([fz3Area, fz3Area])
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high'
    })
  })

  it('getFloodZones should return data as expected for FZ2 only', async () => {
    mockEsriRequest([fz2Area, fz2Area]) // We send two areas so that early exit lines are covered
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      floodZoneLevel: 'medium'
    })
  })

  it('getFloodZones should return data as expected for FZ2 and FZ3', async () => {
    mockEsriRequest([fz2Area, fz3Area, fz2Area, fz3Area]) // We send multiple areas so that early exit lines are covered
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      floodZoneLevel: 'high'
    })
  })

  it('getFloodZones should return data as expected for FZ1', async () => {
    mockEsriRequest([])
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon })
    expect(response).toEqual({
      floodZone: '1',
      floodzone_2: false,
      floodzone_3: false,
      floodZoneLevel: 'low'
    })
  })

  it('getFloodZones should throw if ezriRequest throws"', async () => {
    try {
      mockEsriRequestWithThrow()
      await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      console.log(err)
      expect(err.message).toEqual('mocked error')
    }
  })
})
