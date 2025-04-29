const { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests } = require('../../../services/__tests__/__mocks__/agol')
const { getSurfaceWater } = require('../getSurfaceWater')

const surfaceWaterLowArea = {
  attributes: {
    Confidence: 1,
    OBJECTID: 12345,
    Risk_band: 'Low',
    Shape__Area: 8000,
    Shape__Length: 8000
  }
}
const surfaceWaterMediumArea = {
  attributes: {
    Confidence: 1,
    OBJECTID: 12345,
    Risk_band: 'Medium',
    Shape__Area: 8000,
    Shape__Length: 8000
  }
}
const surfaceWaterHighArea = {
  attributes: {
    Confidence: 1,
    OBJECTID: 12345,
    Risk_band: 'High',
    Shape__Area: 8000,
    Shape__Length: 8000
  }
}

// dummy polygon
const polygon = '[[123,456],[125,457],[125,456],[123,456]]'

describe('getSurfaceWater', () => {
  afterAll(async () => {
    stopMockingEsriRequests()
  })

  it('getSurfaceWater should return data as expected for High surface water area', async () => {
    mockEsriRequest([surfaceWaterHighArea, surfaceWaterMediumArea, surfaceWaterLowArea])
    const { surfaceWater } = await getSurfaceWater({ polygon })
    expect(surfaceWater).toEqual({
      riskBandId: 3,
      riskBand: 'High',
      riskBandPercent: '3.3',
      riskBandOdds: '1 in 30'
    })
  })

  it('getSurfaceWater should return data as expected for Medium surface water area', async () => {
    mockEsriRequest([surfaceWaterMediumArea, surfaceWaterLowArea])
    const { surfaceWater } = await getSurfaceWater({ polygon })
    expect(surfaceWater).toEqual({
      riskBandId: 2,
      riskBand: 'Medium',
      riskBandPercent: '1',
      riskBandOdds: '1 in 100'
    })
  })

  it('getSurfaceWater should return data as expected for Low surface water area', async () => {
    mockEsriRequest([surfaceWaterLowArea, surfaceWaterLowArea])
    const { surfaceWater } = await getSurfaceWater({ polygon })
    expect(surfaceWater).toEqual({
      riskBandId: 1,
      riskBand: 'Low',
      riskBandPercent: '0.1',
      riskBandOdds: '1 in 1000'
    })
  })

  it('getSurfaceWater should return data as expected for no surface water hits', async () => {
    mockEsriRequest([surfaceWaterLowArea, surfaceWaterLowArea])
    const { surfaceWater } = await getSurfaceWater({ polygon })
    expect(surfaceWater).toEqual({
      riskBandId: 1,
      riskBand: 'Low',
      riskBandPercent: '0.1',
      riskBandOdds: '1 in 1000'
    })
  })

  it('getSurfaceWater should return data as expected for no surface water hits', async () => {
    mockEsriRequest([])
    const { surfaceWater } = await getSurfaceWater({ polygon })
    expect(surfaceWater).toEqual({
      riskBandId: -1,
      riskBand: false
    })
  })

  it('getSurfaceWater should throw if esriFeatureRequest throws', async () => {
    try {
      mockEsriRequestWithThrow()
      await getSurfaceWater({ geometryType: 'esriGeometryPolygon', polygon })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      console.log(err)
      expect(err.message).toEqual('mocked error')
    }
  })
})
