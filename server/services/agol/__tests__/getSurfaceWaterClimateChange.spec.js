const { getSurfaceWaterClimateChange } = require('../getSurfaceWaterClimateChange')
const { esriFeatureRequest } = require('../esriFeatureRequest')

jest.mock('../esriFeatureRequest', () => ({
  esriFeatureRequest: jest.fn()
})
)

// dummy polygon
const polygon = '[[123,456],[125,457],[125,456],[123,456]]'

describe('getSurfaceWaterClimateChange', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('getSurfaceWaterClimateChange should return data as expected for High probability water area', async () => {
    esriFeatureRequest.mockReturnValueOnce([{ attributes: { OBJECTID: 1, Depth_band: '300-600mm', Shape__Area: 1000, Shape__Length: 100 } }])
    const { surfaceWaterClimateChange } = await getSurfaceWaterClimateChange({ polygon })
    expect(surfaceWaterClimateChange).toEqual({
      riskBandPercent: '3.3',
      riskBandOdds: '1 in 30'
    })
  })

  it('getSurfaceWaterClimateChange should return data as expected for Medium surface water area', async () => {
    esriFeatureRequest
      .mockReturnValueOnce([])
      .mockReturnValueOnce([{ attributes: { OBJECTID: 1, Depth_band: '300-600mm', Shape__Area: 1000, Shape__Length: 100 } }])

    const { surfaceWaterClimateChange } = await getSurfaceWaterClimateChange({ polygon })
    expect(surfaceWaterClimateChange).toEqual({
      riskBandPercent: '1',
      riskBandOdds: '1 in 100'
    })
  })

  it('getSurfaceWaterClimateChange should return data as expected for Low surface water area', async () => {
    esriFeatureRequest
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([{ attributes: { OBJECTID: 1, Depth_band: '300-600mm', Shape__Area: 1000, Shape__Length: 100 } }])

    const { surfaceWaterClimateChange } = await getSurfaceWaterClimateChange({ polygon })
    expect(surfaceWaterClimateChange).toEqual({
      riskBandPercent: '0.1',
      riskBandOdds: '1 in 1000'
    })
  })

  it('getSurfaceWaterClimateChange should return false for surface water area', async () => {
    esriFeatureRequest
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])

    const { surfaceWaterClimateChange } = await getSurfaceWaterClimateChange({ polygon })
    expect(surfaceWaterClimateChange).toEqual(false)
  })
})
