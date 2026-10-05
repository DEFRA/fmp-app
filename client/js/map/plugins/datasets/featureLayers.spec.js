const { featureLayers } = require('./featureLayers.js')

describe('featureLayers', () => {
  const agolServiceUrl = 'https://example.com/arcgis/rest/services'
  const layerNameSuffix = '_NON_PRODUCTION'

  it('should return the main rivers, water storage and flood defence datasets', () => {
    const datasets = featureLayers(agolServiceUrl, layerNameSuffix)

    expect(datasets.map((d) => d.id)).toEqual(['mainrivers', 'waterstorage', 'flooddefence'])
  })

  it('should not apply the layer name suffix to the main rivers tiles url', () => {
    const [mainRivers] = featureLayers(agolServiceUrl, layerNameSuffix)

    expect(mainRivers.tiles).toBe(`${agolServiceUrl}/Statutory_Main_River_Map/FeatureServer`)
  })

  it('should apply the layer name suffix to the water storage and flood defence tiles urls', () => {
    const [, waterStorage, floodDefence] = featureLayers(agolServiceUrl, layerNameSuffix)

    expect(waterStorage.tiles).toBe(`${agolServiceUrl}/Flood_Storage_Areas${layerNameSuffix}/FeatureServer`)
    expect(floodDefence.tiles).toBe(`${agolServiceUrl}/Defences${layerNameSuffix}/FeatureServer`)
  })

  it('should mark every feature layer dataset as a shown-in-key FeatureService', () => {
    const datasets = featureLayers(agolServiceUrl, layerNameSuffix)

    datasets.forEach((dataset) => {
      expect(dataset.type).toBe('FeatureService')
      expect(dataset.showInKey).toBe(true)
    })
  })

  it('should group every feature layer dataset under the "Map features" label', () => {
    const datasets = featureLayers(agolServiceUrl, layerNameSuffix)

    datasets.forEach((dataset) => {
      expect(dataset.groupLabel).toBe('Map features')
    })
  })

  it('should label and colour the main rivers dataset as a dark teal / white line', () => {
    const [mainRivers] = featureLayers(agolServiceUrl, layerNameSuffix)

    expect(mainRivers.label).toBe('Main rivers')
    expect(mainRivers.style.renderer.symbol.color).toEqual({ outdoor: '#12393d', dark: '#ffffff' })
    expect(mainRivers.style.stroke).toEqual({ outdoor: '#12393d', dark: '#ffffff' })
  })

  it('should label and colour the water storage dataset as a dark teal / white cross-hatch', () => {
    const [, waterStorage] = featureLayers(agolServiceUrl, layerNameSuffix)

    expect(waterStorage.label).toBe('Water storage')
    expect(waterStorage.style.renderer.symbol.color).toEqual({ outdoor: '#12393d', dark: '#ffffff' })
    expect(waterStorage.style.renderer.symbol.outline.color).toEqual({ outdoor: '#12393d', dark: '#ffffff' })
    expect(waterStorage.style.stroke).toEqual({ outdoor: '#12393d', dark: '#ffffff' })
  })

  it('should label and colour the flood defence dataset as an orange line', () => {
    const [, , floodDefence] = featureLayers(agolServiceUrl, layerNameSuffix)

    expect(floodDefence.label).toBe('Flood defence')
    expect(floodDefence.style.renderer.symbol.color).toEqual({ outdoor: '#f47738', dark: '#f47738' })
    expect(floodDefence.style.stroke).toEqual({ outdoor: '#f47738', dark: '#f47738' })
  })
})
