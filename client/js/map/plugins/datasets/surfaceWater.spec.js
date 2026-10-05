const loadSurfaceWater = () => {
  jest.resetModules()
  return require('./surfaceWater.js')
}

describe('surfaceWaterDatasets', () => {
  const agolVectorTileUrl = 'https://example.com/arcgis/rest/services'
  const layerNameSuffix = '_NON_PRODUCTION'

  it('should flatten the generated datasets for all 6 present day / climate change AEP combinations', () => {
    const { surfaceWaterDatasets } = loadSurfaceWater()

    const datasets = surfaceWaterDatasets({ agolVectorTileUrl, layerNameSuffix })

    // first config contributes 3 datasets (including the shared depths key), the other 5 contribute 2 each
    expect(datasets).toHaveLength(3 + 5 * 2)
  })

  it('should only include a single shared depths key dataset', () => {
    const { surfaceWaterDatasets } = loadSurfaceWater()

    const datasets = surfaceWaterDatasets({ agolVectorTileUrl, layerNameSuffix })

    const depthsKeys = datasets.filter((d) => d.id === 'depths-key')
    expect(depthsKeys).toHaveLength(1)
  })
})

describe('surfaceWaterExtentsKey', () => {
  it('should expose one sublayer per surface water depth extent', () => {
    const { surfaceWaterExtentsKey } = loadSurfaceWater()

    expect(surfaceWaterExtentsKey.sublayers).toHaveLength(7)
    expect(surfaceWaterExtentsKey.showInKey).toBe(true)
  })

  it('should label and colour the key as a blue / teal fill matching the non-flood-zone colours', () => {
    const { surfaceWaterExtentsKey } = loadSurfaceWater()

    expect(surfaceWaterExtentsKey.label).toBe('Surface water')
    expect(surfaceWaterExtentsKey.groupLabel).toBe('Surface water')
    expect(surfaceWaterExtentsKey.style).toEqual({
      stroke: { outdoor: '#2b8cbe', dark: '#7fcdbb' },
      fill: { outdoor: '#2b8cbe', dark: '#7fcdbb' }
    })
  })

  it('should label each depth extent sublayer with its literal depth range text', () => {
    const { surfaceWaterExtentsKey } = loadSurfaceWater()

    expect(surfaceWaterExtentsKey.sublayers.map((s) => s.label)).toEqual([
      'Full extent of flooding',
      'Extent over 150mm',
      'Extent over 300mm',
      'Extent over 600mm',
      'Extent over 900mm',
      'Extent over 1200mm',
      'Extent over 2300mm'
    ])
  })
})
