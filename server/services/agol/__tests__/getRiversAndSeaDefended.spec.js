const { mockEsriRequest, mockEsriRequestWithThrow } = require('../../../services/__tests__/__mocks__/agol')
const { getRiversAndSeaDefended } = require('../getRiversAndSeaDefended')

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

describe('getRiversAndSeaDefended', () => {
  it('getRiversAndSeaDefended should return data as expected for no data', async () => {
    mockEsriRequest({ layers })
    const { riversAndSeaDefended } = await getRiversAndSeaDefended({ polygon })
    expect(riversAndSeaDefended).toEqual({
      riskBandId: 3,
      riskBandPercent: false,
      riskBandOdds: false
    })
  })

  it('getRiversAndSeaDefended should return data as expected for low data', async () => {
    layers[2].count = 1
    mockEsriRequest({ layers })
    const { riversAndSeaDefended } = await getRiversAndSeaDefended({ polygon })
    expect(riversAndSeaDefended).toEqual({
      riskBandId: 2,
      riskBandPercent: '0.1',
      riskBandOdds: '1 in 1000'
    })
  })

  it('getRiversAndSeaDefended should return data as expected for medium data', async () => {
    layers[1].count = 1
    mockEsriRequest({ layers })
    const { riversAndSeaDefended } = await getRiversAndSeaDefended({ polygon })
    expect(riversAndSeaDefended).toEqual({
      riskBandId: 1,
      riskBandPercent: '1',
      riskBandOdds: '1 in 100'
    })
  })

  it('getRiversAndSeaDefended should return data as expected for high data', async () => {
    layers[0].count = 1
    mockEsriRequest({ layers })
    const { riversAndSeaDefended } = await getRiversAndSeaDefended({ polygon })
    expect(riversAndSeaDefended).toEqual({
      riskBandId: 0,
      riskBandPercent: '3.3',
      riskBandOdds: '1 in 30'
    })
  })

  it('getRiversAndSeaDefended should return data if empty layers', async () => {
    mockEsriRequest({ layers: [] })
    const { riversAndSeaDefended } = await getRiversAndSeaDefended({ polygon })
    expect(riversAndSeaDefended).toEqual({
      riskBandId: 3,
      riskBandPercent: false,
      riskBandOdds: false
    })
  })

  it('getRiversAndSeaDefended should throw if duff data', async () => {
    try {
      mockEsriRequest(undefined)
      await getRiversAndSeaDefended({ polygon })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('Cannot read properties of undefined (reading \'reduce\')')
    }
  })

  it('getRiversAndSeaDefended should throw if esriFeatureRequest throws', async () => {
    try {
      mockEsriRequestWithThrow()
      await getRiversAndSeaDefended({ polygon })
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('mocked error')
    }
  })
})
