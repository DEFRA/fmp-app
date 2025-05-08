const { mockEsriRequest, mockEsriRequestWithThrow } = require('../../../services/__tests__/__mocks__/agol')
const { getRiversAndSeaUndefendedCC } = require('../getRiversAndSeaUndefendedCC')

const layers = [{
  id: 0,
  count: 0
}, {
  id: 1,
  count: 0
}]

// dummy polygon
const polygon = '[[123,456],[125,457],[125,456],[123,456]]'

describe('getRiversAndSeaUndefendedCC', () => {
  it('getRiversAndSeaUndefendedCC should return data as expected for no data', async () => {
    mockEsriRequest({ layers })
    const { riversAndSeaUndefendedCC } = await getRiversAndSeaUndefendedCC({ polygon })
    expect(riversAndSeaUndefendedCC).toEqual({
      riskBandId: 2,
      riskBandPercent: false,
      riskBandOdds: false
    })
  })

  it('getRiversAndSeaUndefendedCC should return data as expected for low data', async () => {
    layers[1].count = 1
    mockEsriRequest({ layers })
    const { riversAndSeaUndefendedCC } = await getRiversAndSeaUndefendedCC({ polygon })
    expect(riversAndSeaUndefendedCC).toEqual({
      riskBandId: 1,
      riskBandPercent: '0.1',
      riskBandOdds: '1 in 1000'
    })
  })

  it('getRiversAndSeaUndefendedCC should return data as expected for medium data', async () => {
    layers[0].count = 1
    mockEsriRequest({ layers })
    const { riversAndSeaUndefendedCC } = await getRiversAndSeaUndefendedCC({ polygon })
    expect(riversAndSeaUndefendedCC).toEqual({
      riskBandId: 0,
      riskBandPercent: '1',
      riskBandOdds: '1 in 100'
    })
  })

  it('getRiversAndSeaUndefendedCC should return data if empty layers', async () => {
    mockEsriRequest({ layers: [] })
    const { riversAndSeaUndefendedCC } = await getRiversAndSeaUndefendedCC({ polygon })
    expect(riversAndSeaUndefendedCC).toEqual({
      riskBandId: 2,
      riskBandPercent: false,
      riskBandOdds: false
    })
  })

  it('getRiversAndSeaUndefendedCC should throw if duff data', async () => {
    try {
      mockEsriRequest(undefined)
      await getRiversAndSeaUndefendedCC({ polygon })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('Cannot read properties of undefined (reading \'reduce\')')
    }
  })

  it('getRiversAndSeaUndefendedCC should throw if esriFeatureRequest throws', async () => {
    try {
      mockEsriRequestWithThrow()
      await getRiversAndSeaUndefendedCC({ polygon })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('mocked error')
    }
  })
})
