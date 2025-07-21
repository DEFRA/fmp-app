const { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests } = require('../../__tests__/__mocks__/agol')
const { getFloodZonesClimateChange } = require('../getFloodZonesClimateChange')

const fzClimateChangeArea = {
  attributes: {
    OBJECTID: 1303621,
    Flood_source: 'sea',
    Name: 'Flood Zones plus climate change',
    Shape__Area: 722373.374420166,
    Shape__Length: 10602.588856535418
  }
}
const fzNoDataArea = {
  attributes: {
    OBJECTID: 1416666,
    Flood_source: null,
    Name: 'Unavailable',
    Shape__Area: 261988684.5807953,
    Shape__Length: 148102.43137099937
  }
}

describe('getFloodZonesClimateChange', () => {
  afterAll(async () => {
    stopMockingEsriRequests()
  })

  it('getFloodZonesClimateChange should return data as expected for no-data only', async () => {
    mockEsriRequest([fzNoDataArea, fzNoDataArea])
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const response = await getFloodZonesClimateChange({ geometryType: 'esriGeometryPolygon', polygon })
    expect(response).toEqual({
      floodZoneClimateChange: false,
      floodZoneClimateChangeNoData: true
    })
  })

  it('getFloodZonesClimateChange should return data as expected for climate change only', async () => {
    mockEsriRequest([fzClimateChangeArea, fzClimateChangeArea]) // We send two areas so that early exit lines are covered
    const response = await getFloodZonesClimateChange({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZoneClimateChange: true,
      floodZoneClimateChangeNoData: false
    })
  })

  it('getFloodZonesClimateChange should return data as expected for climate change and no-data', async () => {
    mockEsriRequest([fzClimateChangeArea, fzNoDataArea, fzClimateChangeArea, fzNoDataArea]) // We send multiple areas so that early exit lines are covered
    const response = await getFloodZonesClimateChange({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
    expect(response).toEqual({
      floodZoneClimateChange: true,
      floodZoneClimateChangeNoData: true
    })
  })

  it('getFloodZonesClimateChange should return data as expected for no climate change and no no-data', async () => {
    mockEsriRequest([])
    const polygon = '[[123,456],[125,457],[125,456],[123,456]]'
    const response = await getFloodZonesClimateChange({ geometryType: 'esriGeometryPolygon', polygon })
    expect(response).toEqual({
      floodZoneClimateChange: false,
      floodZoneClimateChangeNoData: false
    })
  })

  it('getFloodZonesClimateChange should throw if ezriRequest throws"', async () => {
    try {
      mockEsriRequestWithThrow()
      await getFloodZonesClimateChange({ geometryType: 'esriGeometryPolygon', polygon: '[[123,456],[125,457],[125,456],[123,456]]' })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      console.log(err)
      expect(err.message).toEqual('mocked error')
    }
  })
})
