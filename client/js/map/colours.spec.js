const { colours, getKeyItemFill } = require('./colours.js')

describe('colours', () => {
  it('should pair each colour token with a light/dark variant', () => {
    expect(colours.nonFloodZone).toEqual([colours.nonFloodZoneLight, colours.nonFloodZoneDark])
    expect(colours.floodZone2).toEqual({ default: expect.any(String), dark: expect.any(String) })
    expect(colours.floodZone3).toEqual({ default: expect.any(String), dark: expect.any(String) })
    expect(colours.floodZoneClimateChange).toEqual({ default: expect.any(String), dark: expect.any(String) })
  })

  it('should expose 7 depth band pairs in ascending depth order', () => {
    expect(colours.nonFloodZoneDepthBands).toHaveLength(7)
    colours.nonFloodZoneDepthBands.forEach((pair) => {
      expect(pair).toHaveLength(2)
    })
  })

  it('should expose black and white', () => {
    expect(colours.black).toBe('#000000')
    expect(colours.white).toBe('#ffffff')
  })

  it('should expose feature colours with default/dark variants', () => {
    expect(colours.waterStorageAreas).toEqual(expect.objectContaining({ default: expect.any(String), dark: expect.any(String) }))
    expect(colours.mainRivers).toHaveProperty('default')
    expect(colours.mainRivers).toHaveProperty('dark')
    expect(colours.floodDefences).toHaveProperty('default')
    expect(colours.searchPin).toHaveProperty('default')
    expect(colours.searchPin).toHaveProperty('dark')
  })
})

describe('getKeyItemFill', () => {
  it('should format a [light, dark] pair as a descriptive string', () => {
    expect(getKeyItemFill(['#111111', '#222222'])).toBe('default: #111111, dark: #222222')
  })
})
