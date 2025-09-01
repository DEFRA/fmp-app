const { mockPolygons } = require('./__mocks__/floodDataByPolygonMock')
const { getFloodDataByPolygon } = require('../../../server/services/floodDataByPolygon')

describe('getFloodDataByPolygon - Error Handling Scenarios', () => {
  it('getFloodDataByPolygon without polygon should throw "No Polygon provided"', async () => {
    try {
      const response = await getFloodDataByPolygon('')
      expect(response).toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('getFloodDataByPolygon - No Polygon provided')
    }
  })

  it('getFloodDataByPolygon should throw if ezriRequest throws"', async () => {
    try {
      await getFloodDataByPolygon(mockPolygons.throws)
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      console.log(err)
      expect(err.message).toEqual('Fetching getFloodDataByPolygon failed: ')
    }
  })
})

describe('getFloodDataByPolygon - Flood Zone Only Scenarios', () => {
  it('getFloodDataByPolygon should return data as expected for FZ3 only', async () => {
    const response = await getFloodDataByPolygon(mockPolygons.fz3_only)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneClimateChange: true,
      floodZoneClimateChangeNoData: false,
      floodZoneLevel: 'high',
      isRiskAdminArea: false,
      surfaceWater: { riskBandId: -1, riskBand: false }
    })
  })

  it('getFloodDataByPolygon should return data as expected for FZ2 only', async () => {
    const response = await getFloodDataByPolygon(mockPolygons.fz2_only)
    expect(response).toEqual({
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      floodZoneLevel: 'medium',
      floodZoneClimateChange: false,
      floodZoneClimateChangeNoData: true,
      isRiskAdminArea: false,
      surfaceWater: { riskBandId: -1, riskBand: false }
    })
  })

  it('getFloodDataByPolygon should return data as expected for FZ2 and FZ3', async () => {
    const response = await getFloodDataByPolygon(mockPolygons.fz2_and_3)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      floodZoneLevel: 'high',
      floodZoneClimateChange: false,
      floodZoneClimateChangeNoData: false,
      isRiskAdminArea: false,
      surfaceWater: { riskBandId: -1, riskBand: false }
    })
  })
})

describe('getFloodDataByPolygon - Flood Zone with RiskAdmin Scenarios', () => {
  it('getFloodDataByPolygon should return data as expected for FZ3 only in riskAdminArea', async () => {
    const response = await getFloodDataByPolygon(mockPolygons.inRiskAdmin.fz3_only)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high',
      floodZoneClimateChange: true,
      floodZoneClimateChangeNoData: false,
      isRiskAdminArea: true,
      surfaceWater: { riskBandId: -1, riskBand: false }
    })
  })

  it('getFloodDataByPolygon should return data as expected for FZ2 only in riskAdminArea', async () => {
    const response = await getFloodDataByPolygon(mockPolygons.inRiskAdmin.fz2_only)
    expect(response).toEqual({
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      floodZoneLevel: 'medium',
      floodZoneClimateChange: false,
      floodZoneClimateChangeNoData: true,
      isRiskAdminArea: true,
      surfaceWater: { riskBandId: -1, riskBand: false }
    })
  })

  it('getFloodDataByPolygon should return data as expected for FZ2 and FZ3 in riskAdminArea', async () => {
    const response = await getFloodDataByPolygon(mockPolygons.inRiskAdmin.fz2_and_3)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      floodZoneLevel: 'high',
      floodZoneClimateChange: false,
      floodZoneClimateChangeNoData: false,
      isRiskAdminArea: true,
      surfaceWater: { riskBandId: -1, riskBand: false }
    })
  })
})
