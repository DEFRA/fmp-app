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
const fz3AreaSea = {
  attributes: {
    OBJECTID: 150663,
    origin: 'modelled and recorded',
    flood_zone: 'FZ3',
    asset_state: 'defended & undefended',
    flood_source: 'sea',
    flood_source_and_state: 'sea-undefended-modelled_river-defended-modelled_recorded',
    Shape__Area: 108075.19142150879,
    Shape__Length: 5098.461924182072
  }
}
const fz3AreaRiverAndSea = {
  attributes: {
    OBJECTID: 150663,
    origin: 'modelled and recorded',
    flood_zone: 'FZ3',
    asset_state: 'defended & undefended',
    flood_source: 'river and sea',
    flood_source_and_state: 'river-and-sea-undefended-modelled_river-defended-modelled_recorded',
    Shape__Area: 108075.19142150879,
    Shape__Length: 5098.461924182072
  }
}
const fz3AreaRiver = {
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
    mockEsriRequest([fz3AreaRiver, fz3AreaRiver])
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: true,
      hasSeaSource: false,
      hasRiversAndSeaSource: false,
      floodSource: 'rivers'
    })
  })

  it('getFloodZones should return data as expected for FZ2 only', async () => {
    mockEsriRequest([fz2Area, fz2Area]) // We send two areas so that early exit lines are covered
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      floodZoneLevel: 'medium',
      hasRiversSource: true,
      hasSeaSource: false,
      hasRiversAndSeaSource: false,
      floodSource: 'rivers'
    })
  })

  it('getFloodZones should return data as expected for FZ2 and FZ3', async () => {
    mockEsriRequest([fz2Area, fz3AreaRiver, fz2Area, fz3AreaRiver]) // We send multiple areas so that early exit lines are covered
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: true,
      hasSeaSource: false,
      hasRiversAndSeaSource: false,
      floodSource: 'rivers'
    })
  })

  it('getFloodZones should return hasRiverSource as true and floodSource as "rivers" for river flood zones', async () => {
    mockEsriRequest([fz3AreaRiver, fz3AreaRiver])
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: true,
      hasSeaSource: false,
      hasRiversAndSeaSource: false,
      floodSource: 'rivers'
    })
  })

  it('getFloodZones should return hasRiverSource as true and floodSource as "the sea" for sea flood zones', async () => {
    mockEsriRequest([fz3AreaSea, fz3AreaSea])
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: false,
      hasSeaSource: true,
      hasRiversAndSeaSource: false,
      floodSource: 'the sea'
    })
  })

  it('getFloodZones should return hasRiverSource as true and floodSource as "rivers and the sea" for river and sea flood zones', async () => {
    mockEsriRequest([fz3AreaRiverAndSea, fz3AreaRiverAndSea])
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: false,
      hasSeaSource: false,
      hasRiversAndSeaSource: true,
      floodSource: 'rivers and the sea'
    })
  })

  it('getFloodZones should return hasRiversAndSeaSource as true and floodSource as "rivers and the sea" for flood zones with river and the sea mixture', async () => {
    mockEsriRequest([fz3AreaRiver, fz3AreaSea])
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: true,
      hasSeaSource: true,
      hasRiversAndSeaSource: true,
      floodSource: 'rivers and the sea'
    })
  })

  it('getFloodZones should return hasRiversAndSeaSource as true and floodSource as "rivers and the sea" for flood zones with river and the sea mixture', async () => {
    mockEsriRequest([fz3AreaRiver, fz3AreaSea,])
    const response = await getFloodZones({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: true,
      hasSeaSource: true,
      hasRiversAndSeaSource: true,
      floodSource: 'rivers and the sea'
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
      floodZoneLevel: 'low',
      hasRiversSource: false,
      hasSeaSource: false,
      hasRiversAndSeaSource: false,
      floodSource: null
    })
  })

  it('should stop iterating early (break is hit) if feature list include fz 2, 3, river and sea', async () => {
    const poison = {
      get attributes () {
        throw new Error('Loop did not break!')
      }
    }
    mockEsriRequest([
      fz2Area,
      fz3AreaRiver,
      fz3AreaSea, // break condition satisfied here
      poison      // should never be accessed
    ])
    const response = await getFloodZones({
      geometryType: 'esriGeometryPolygon',
      polygon: '[[123,456],[125,457],[125,456],[123,456]]'
    })
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      floodZoneLevel: 'high',
      hasRiversSource: true,
      hasSeaSource: true,
      hasRiversAndSeaSource: true,
      floodSource: 'rivers and the sea'
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
