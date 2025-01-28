const { mockEsriRestRequest, mockEsriRestRequestWithThrow } = require('../../../services/__tests__/__mocks__/agol')
const { getRiversAndSeaDefendedCC } = require('../getRiversAndSeaDefendedCC')

const layers = [{
  id: 0,
  count: 0
}, {
  id: 1,
  count: 0
}, {
  id: 2,
  count: 0
}]

// dummy polygon
const polygon = '[[123,456],[125,457],[125,456],[123,456]]'

describe('getRiversAndSeaDefendedCC', () => {
  it('getRiversAndSeaDefendedCC should return data as expected for no data', async () => {
    mockEsriRestRequest({ layers })
    const { riversAndSeaDefendedCC } = await getRiversAndSeaDefendedCC({ polygon })
    expect(riversAndSeaDefendedCC).toEqual({
      riskBandId: 3,
      riskBandPercent: false
    })
  })

  it('getRiversAndSeaDefendedCC should return data as expected for low data', async () => {
    layers[2].count = 1
    mockEsriRestRequest({ layers })
    const { riversAndSeaDefendedCC } = await getRiversAndSeaDefendedCC({ polygon })
    expect(riversAndSeaDefendedCC).toEqual({
      riskBandId: 2,
      riskBandPercent: '0.1'
    })
  })

  it('getRiversAndSeaDefendedCC should return data as expected for medium data', async () => {
    layers[1].count = 1
    mockEsriRestRequest({ layers })
    const { riversAndSeaDefendedCC } = await getRiversAndSeaDefendedCC({ polygon })
    expect(riversAndSeaDefendedCC).toEqual({
      riskBandId: 1,
      riskBandPercent: '1'
    })
  })

  it('getRiversAndSeaDefendedCC should return data as expected for high data', async () => {
    layers[0].count = 1
    mockEsriRestRequest({ layers })
    const { riversAndSeaDefendedCC } = await getRiversAndSeaDefendedCC({ polygon })
    expect(riversAndSeaDefendedCC).toEqual({
      riskBandId: 0,
      riskBandPercent: '3.3'
    })
  })

  it('getRiversAndSeaDefendedCC should return data if empty layers', async () => {
    mockEsriRestRequest({ layers: [] })
    const { riversAndSeaDefendedCC } = await getRiversAndSeaDefendedCC({ polygon })
    expect(riversAndSeaDefendedCC).toEqual({
      riskBandId: 3,
      riskBandPercent: false
    })
  })

  it('getRiversAndSeaDefendedCC should throw if duff data', async () => {
    try {
      mockEsriRestRequest(undefined)
      await getRiversAndSeaDefendedCC({ polygon })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('Cannot read properties of undefined (reading \'reduce\')')
    }
  })

  it('getRiversAndSeaDefendedCC should throw if esriRequest throws', async () => {
    try {
      mockEsriRestRequestWithThrow()
      await getRiversAndSeaDefendedCC({ polygon })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('mocked error')
    }
  })
})
