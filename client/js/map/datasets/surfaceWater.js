import { terms } from '../terms.js'
import { colours } from '../colours.js'
import { surfaceWaterDatasetGenerator } from './surfaceWaterDatasetGenerator.js'

export const surfaceWaterDatasets = ({ agolVectorTileUrl, layerNameSuffix }) => {
  const datasets = [
    // Surface Water Present Day
    ...surfaceWaterDatasetGenerator({
      agolVectorTileUrl,
      layerNameSuffix,
      id: 'surfacewater-presentday-low',
      tileName: 'Surface_Water_Spatial_Planning_1_in_1000_Depths',
      sourceLayer: 'Surface Water Spatial Planning 1 in 1000 Depths',
      timeframe: ['presentday'],
      aep: ['low'],
    }),

    ...surfaceWaterDatasetGenerator({
      agolVectorTileUrl,
      layerNameSuffix,
      id: 'surfacewater-presentday-medium',
      tileName: 'Surface_Water_Spatial_Planning_1_in_100_Depths',
      sourceLayer: 'Surface Water Spatial Planning 1 in 100 Depths',
      timeframe: ['presentday'],
      aep: ['medium'],
    }),

    ...surfaceWaterDatasetGenerator({
      agolVectorTileUrl,
      layerNameSuffix,
      id: 'surfacewater-presentday-high',
      tileName: 'Surface_Water_Spatial_Planning_1_in_30_Depths',
      sourceLayer: 'Surface Water Spatial Planning 1 in 30 Depths',
      timeframe: ['presentday'],
      aep: ['high'],
    }),

    // Surface Water Climate Change
    ...surfaceWaterDatasetGenerator({
      agolVectorTileUrl,
      layerNameSuffix,
      id: 'surfacewater-climatechange-low',
      tileName: 'Surface_Water_Spatial_Planning_1_in_1000_CCP1_Depths',
      sourceLayer: 'Surface Water Spatial Planning 1 in 1000 CCP1 Depths',
      timeframe: ['climatechange'],
      aep: ['low'],
    }),

    ...surfaceWaterDatasetGenerator({
      agolVectorTileUrl,
      layerNameSuffix,
      id: 'surfacewater-climatechange-medium',
      tileName: 'Surface_Water_Spatial_Planning_1_in_100_CCP1_Depths',
      sourceLayer: 'Surface Water Spatial Planning 1 in 100 CCP1 Depths',
      timeframe: ['climatechange'],
      aep: ['medium'],
    }),

    ...surfaceWaterDatasetGenerator({
      agolVectorTileUrl,
      layerNameSuffix,
      id: 'surfacewater-climatechange-high',
      tileName: 'Surface_Water_Spatial_Planning_1_in_30_CCP1_Depths',
      sourceLayer: 'Surface Water Spatial Planning 1 in 30 CCP1 Depths',
      timeframe: ['climatechange'],
      aep: ['high'],
    })
  ]
  return datasets
}
const surfaceWaterExtentsKeyStyle = {
  stroke: { outdoor: colours.nonFloodZoneLight, dark: colours.nonFloodZoneDark },
  fill: { outdoor: colours.nonFloodZoneLight, dark: colours.nonFloodZoneDark },
}

export const surfaceWaterExtentsKey = {
  id: 'surfacewater-extents-key',
  label: terms.labels.surfaceWater,
  // groupLabel: 'Datasets',
  showInKey: true,
  style: surfaceWaterExtentsKeyStyle,
  sublayers: [
    {
      id: 'key-150',
      label: terms.depth.depth150,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['depth150'] } }
    },
    {
      id: 'key-300',
      label: terms.depth.depth300,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['depth300'] } }
    },
    {
      id: 'key-600',
      label: terms.depth.depth600,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['depth600'] } }
    },
    {
      id: 'key-900',
      label: terms.depth.depth900,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['depth900'] } }
    },
    {
      id: 'key-1200',
      label: terms.depth.depth1200,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['depth1200'] } }
    },
    {
      id: 'key-2300',
      label: terms.depth.depth2300,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['depth2300'] } }
    },
    {
      id: 'key-over-2300',
      label: terms.depth.depthOver2300,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['depthOver2300'] } }
    }
  ]
}
