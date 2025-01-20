const { mockPolygons } = require('./__mocks__/floodZonesByPolygonMock')
const {
  method: getFloodZonesByPolygon,
  options: { generateKey }
} = require('../../../server/services/flood-zones-by-polygon')

describe('getFloodZonesByPolygon - Error Handling Scenarios', () => {
  it('getFloodZonesByPolygon without polygon should throw "No Polygon provided"', async () => {
    try {
      const response = await getFloodZonesByPolygon('')
      expect(response).toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('getFloodZonesByPolygon - No Polygon provided')
    }
  })

  it('getFloodZonesByPolygon should throw if ezriRequest throws"', async () => {
    try {
      await getFloodZonesByPolygon(mockPolygons.throws)
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      console.log(err)
      expect(err.message).toEqual('Fetching getFloodZonesByPolygon failed: ')
    }
  })
})

describe('getFloodZonesByPolygon - Flood Zone Only Scenarios', () => {
  it('getFloodZonesByPolygon should return data as expected for FZ3 only', async () => {
    const response = await getFloodZonesByPolygon(mockPolygons.fz3_only)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      surface_water: false,
      isRiskAdminArea: false
    })
  })

  it('getFloodZonesByPolygon should return data as expected for FZ2 only', async () => {
    const response = await getFloodZonesByPolygon(mockPolygons.fz2_only)
    expect(response).toEqual({
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      surface_water: false,
      isRiskAdminArea: false
    })
  })

  it('getFloodZonesByPolygon should return data as expected for FZ2 and FZ3', async () => {
    const response = await getFloodZonesByPolygon(mockPolygons.fz2_and_3)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      surface_water: false,
      isRiskAdminArea: false
    })
  })
})

describe('getFloodZonesByPolygon - Flood Zone with RiskAdmin Scenarios', () => {
  it('getFloodZonesByPolygon should return data as expected for FZ3 only in riskAdminArea', async () => {
    const response = await getFloodZonesByPolygon(mockPolygons.inRiskAdmin.fz3_only)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      surface_water: false,
      isRiskAdminArea: true
    })
  })

  it('getFloodZonesByPolygon should return data as expected for FZ2 only in riskAdminArea', async () => {
    const response = await getFloodZonesByPolygon(mockPolygons.inRiskAdmin.fz2_only)
    expect(response).toEqual({
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      surface_water: false,
      isRiskAdminArea: true
    })
  })

  it('getFloodZonesByPolygon should return data as expected for FZ2 and FZ3 in riskAdminArea', async () => {
    const response = await getFloodZonesByPolygon(mockPolygons.inRiskAdmin.fz2_and_3)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      surface_water: false,
      isRiskAdminArea: true
    })
  })
})

describe('generateKey', () => {
  it('generateKey should stringify a polygon', async () => {
    expect(generateKey([123, 456])).toEqual('[123,456]')
  })
})
