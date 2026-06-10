const {
  formatFloodSource,
  assignFloodSource
} = require('../floodDataFunctions')

describe('formatFloodSource', () => {
  it('should return "rivers and the sea" when both sources are true', () => {
    const result = formatFloodSource(true, true)
    expect(result).toEqual('rivers and the sea')
  })

  it('should return "rivers" when only river source is true', () => {
    const result = formatFloodSource(true, false)
    expect(result).toEqual('rivers')
  })

  it('should return "the sea" when only sea source is true', () => {
    const result = formatFloodSource(false, true)
    expect(result).toEqual('the sea')
  })

  it('should return null when neither source is true', () => {
    const result = formatFloodSource(false, false)
    expect(result).toEqual(null)
  })
})

describe('assignFloodSource', () => {
  it('should set hasRiversSource when flood_source is river', () => {
    const attributes = { flood_source: 'river' }
    const results = { hasRiversSource: false, hasSeaSource: false }
    const response = assignFloodSource(attributes, results)
    expect(response).toEqual({
      hasRiversSource: true,
      hasSeaSource: false
    })
  })

  it('should set hasSeaSource when flood_source is sea', () => {
    const attributes = { flood_source: 'sea' }
    const results = { hasRiversSource: false, hasSeaSource: false }
    const response = assignFloodSource(attributes, results)
    expect(response).toEqual({
      hasRiversSource: false,
      hasSeaSource: true
    })
  })

  it('should set both sources when flood_source is river and sea', () => {
    const attributes = { flood_source: 'river and sea' }
    const results = { hasRiversSource: false, hasSeaSource: false }
    const response = assignFloodSource(attributes, results)
    expect(response).toEqual({
      hasRiversSource: true,
      hasSeaSource: true
    })
  })

  it('should support Flood_source (capitalised key)', () => {
    const attributes = { Flood_source: 'river' }
    const results = { hasRiversSource: false, hasSeaSource: false }
    const response = assignFloodSource(attributes, results)
    expect(response).toEqual({
      hasRiversSource: true,
      hasSeaSource: false
    })
  })

  it('should preserve existing true values', () => {
    const attributes = { flood_source: 'sea' }
    const results = { hasRiversSource: true, hasSeaSource: false }
    const response = assignFloodSource(attributes, results)
    expect(response).toEqual({
      hasRiversSource: true,
      hasSeaSource: true
    })
  })

  it('should not modify results if no flood_source field exists', () => {
    const attributes = {}
    const results = { hasRiversSource: false, hasSeaSource: false }
    const response = assignFloodSource(attributes, results)
    expect(response).toEqual({
      hasRiversSource: false,
      hasSeaSource: false
    })
  })
})
