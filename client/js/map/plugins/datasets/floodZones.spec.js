const { floodZonesDatasets } = require('./floodZones.js')

describe('floodZonesDatasets', () => {
  const agolVectorTileUrl = 'https://example.com/arcgis/rest/services'
  const layerNameSuffix = '_NON_PRODUCTION'

  it('should return the climate change, present day and key datasets', () => {
    const datasets = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    expect(datasets.map((d) => d.id)).toEqual(['floodzonescc', 'floodzones', 'floodzones-key'])
  })

  it('should build the vector tile urls using the agol url and layer name suffix', () => {
    const [cc, presentDay] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    expect(cc.tiles).toBe(`${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea_CCP1${layerNameSuffix}/VectorTileServer`)
    expect(presentDay.tiles).toBe(`${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea${layerNameSuffix}/VectorTileServer`)
  })

  it('should include climate change, no-data and no-data variant sublayers for the CC dataset', () => {
    const [cc] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    expect(cc.sublayers.map((s) => s.id)).toEqual([
      'climate-change',
      'data-unavailable',
      'data-unavailable-outline',
      'data-unavailable-light',
      'data-unavailable-dark'
    ])
  })

  it('should label and colour the climate change sublayer as a light salmon / dark red fill', () => {
    const [cc] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })
    const [ccSublayer] = cc.sublayers

    expect(ccSublayer.label).toBe('Climate change (2070 to 2125)')
    expect(ccSublayer.style.fill).toEqual({ outdoor: '#F4A582', dark: '#BF3D4A' })
    expect(ccSublayer.style.stroke).toEqual({ outdoor: '#F4A582', dark: '#BF3D4A' })
  })

  it('should label and colour the no-data sublayer as a black / white dotted fill', () => {
    const [cc] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })
    const [, noDataSublayer] = cc.sublayers

    expect(noDataSublayer.label).toBe('Climate change data unavailable')
    expect(noDataSublayer.style.fillPatternForegroundColor).toEqual({ outdoor: '#000000', dark: '#ffffff' })
    expect(noDataSublayer.style.stroke).toEqual({ outdoor: '#000000', dark: '#ffffff' })
  })

  it('should label the CC dataset "Flood zones"', () => {
    const [cc] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    expect(cc.label).toBe('Flood zones')
    expect(cc.groupLabel).toBe('Flood zones')
  })

  it('should include flood zone 2 and 3 sublayers for the present day dataset', () => {
    const [, presentDay] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    expect(presentDay.sublayers.map((s) => s.id)).toEqual(['flood-zone-2', 'flood-zone-3'])
  })

  it('should label the present day dataset "Flood zones"', () => {
    const [, presentDay] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    expect(presentDay.label).toBe('Flood zones')
    expect(presentDay.groupLabel).toBe('Flood zones')
  })

  it('should label and colour flood zone 2 as a blue / light teal fill', () => {
    const [, presentDay] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })
    const [fz2] = presentDay.sublayers

    expect(fz2.label).toBe('Flood zone 2')
    expect(fz2.style.fill).toEqual({ outdoor: '#1d70b8', dark: '#41ab5d' })
    expect(fz2.style.stroke).toEqual({ outdoor: '#1d70b8', dark: '#41ab5d' })
  })

  it('should label and colour flood zone 3 as a dark blue / light green fill', () => {
    const [, presentDay] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })
    const [, fz3] = presentDay.sublayers

    expect(fz3.label).toBe('Flood zone 3')
    expect(fz3.style.fill).toEqual({ outdoor: '#003078', dark: '#e5f5e0' })
    expect(fz3.style.stroke).toEqual({ outdoor: '#003078', dark: '#e5f5e0' })
  })

  it('should build 6 key-only sublayers with unique ids for the key dataset', () => {
    const [, , key] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    expect(key.sublayers).toHaveLength(6)
    key.sublayers.forEach((sublayer) => {
      expect(sublayer.showInKey).toBe(true)
      expect(sublayer.esriStyleLayerId).toBeNull()
    })
    const ids = key.sublayers.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should label the flood zone 2/3 climate-change key sublayers as present day variants', () => {
    const [, , key] = floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix })

    const [, , fz2CcKey, fz3CcKey] = key.sublayers

    expect(fz2CcKey.label).toBe('Flood zone 2 (present day)')
    expect(fz3CcKey.label).toBe('Flood zone 3 (present day)')
  })
})
