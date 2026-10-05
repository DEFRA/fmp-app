const loadGenerator = () => {
  jest.resetModules()
  return require('./surfaceWaterDatasetGenerator.js').surfaceWaterDatasetGenerator
}

const baseArgs = {
  agolVectorTileUrl: 'https://example.com/arcgis/rest/services',
  layerNameSuffix: '_NON_PRODUCTION',
  id: 'surfacewater-presentday-low',
  tileName: 'Surface_Water_Spatial_Planning_1_in_1000_Depths',
  sourceLayer: 'Surface Water Spatial Planning 1 in 1000 Depths',
  timeframe: ['presentday'],
  aep: ['low']
}

describe('surfaceWaterDatasetGenerator', () => {
  it('should generate a depths key plus the extents and depth datasets on the first call', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()

    const result = surfaceWaterDatasetGenerator(baseArgs)

    expect(result.map((d) => d.id)).toEqual(['depths-key', `${baseArgs.id}-extents`, `${baseArgs.id}-depths`])
  })

  it('should not regenerate the depths key on subsequent calls', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()
    surfaceWaterDatasetGenerator(baseArgs)

    const result = surfaceWaterDatasetGenerator({ ...baseArgs, id: 'surfacewater-presentday-medium' })

    expect(result.map((d) => d.id)).toEqual(['surfacewater-presentday-medium-extents', 'surfacewater-presentday-medium-depths'])
  })

  it('should build tile urls from the agol url, tile name and layer name suffix', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()

    const [, extentsDataset, depthDataset] = surfaceWaterDatasetGenerator(baseArgs)

    const expectedUrl = `${baseArgs.agolVectorTileUrl}/${baseArgs.tileName}${baseArgs.layerNameSuffix}/VectorTileServer`
    expect(extentsDataset.tiles).toBe(expectedUrl)
    expect(depthDataset.tiles).toBe(expectedUrl)
  })

  it('should generate 7 extents sublayers and 7 depth sublayers', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()

    const [, extentsDataset, depthDataset] = surfaceWaterDatasetGenerator(baseArgs)

    expect(extentsDataset.sublayers).toHaveLength(7)
    expect(depthDataset.sublayers).toHaveLength(7)
  })

  it('should build depths key sublayers from the depth dataset sublayers with no esriStyleLayerId', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()

    const [depthsKey, , depthDataset] = surfaceWaterDatasetGenerator(baseArgs)

    expect(depthsKey.sublayers).toHaveLength(depthDataset.sublayers.length)
    depthsKey.sublayers.forEach((sublayer) => {
      expect(sublayer.esriStyleLayerId).toBeNull()
    })
  })

  it('should label the extents and depth datasets with their literal surface water labels', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()

    const [, extentsDataset, depthDataset] = surfaceWaterDatasetGenerator(baseArgs)

    expect(extentsDataset.label).toBe('Surface water')
    expect(extentsDataset.style.fill).toEqual({ outdoor: '#2b8cbe', dark: '#7fcdbb' })
    expect(depthDataset.label).toBe('Surface water depth in millimetres')
  })

  it('should label and colour each depth sublayer with its literal depth band text and colour, from deepest to shallowest', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()

    const [, , depthDataset] = surfaceWaterDatasetGenerator(baseArgs)

    expect(depthDataset.sublayers.map((s) => s.label)).toEqual([
      'Over 2300mm',
      '1200 to 2300mm',
      '900 to 1200mm',
      '600 to 900mm',
      '300 to 600mm',
      '150 to 300mm',
      'Below 150mm'
    ])
    expect(depthDataset.sublayers.map((s) => s.style)).toEqual([
      { stroke: { outdoor: '#7f2704', dark: '#238b45' }, fill: { outdoor: '#7f2704', dark: '#238b45' } },
      { stroke: { outdoor: '#a63603', dark: '#41ab5d' }, fill: { outdoor: '#a63603', dark: '#41ab5d' } },
      { stroke: { outdoor: '#d94801', dark: '#74c476' }, fill: { outdoor: '#d94801', dark: '#74c476' } },
      { stroke: { outdoor: '#f16913', dark: '#a1d99b' }, fill: { outdoor: '#f16913', dark: '#a1d99b' } },
      { stroke: { outdoor: '#fd8d3c', dark: '#c7e9c0' }, fill: { outdoor: '#fd8d3c', dark: '#c7e9c0' } },
      { stroke: { outdoor: '#fdae6b', dark: '#e5f5e0' }, fill: { outdoor: '#fdae6b', dark: '#e5f5e0' } },
      { stroke: { outdoor: '#fdd0a2', dark: '#f7fcf5' }, fill: { outdoor: '#fdd0a2', dark: '#f7fcf5' } }
    ])
  })

  it('should label the depths key sublayers with the literal depth band key text', () => {
    const surfaceWaterDatasetGenerator = loadGenerator()

    const [depthsKey] = surfaceWaterDatasetGenerator(baseArgs)

    expect(depthsKey.sublayers.map((s) => s.label)).toEqual(['2300', '1200', '900', '600', '300', '150', '75'])
  })
})
