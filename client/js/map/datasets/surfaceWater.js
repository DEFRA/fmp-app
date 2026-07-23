import { terms } from '../terms.js'
import { colours } from '../colours.js'
import { surfaceWaterDatasetGenerator } from './surfaceWaterDatasetGenerator.js'

const swConfigs = [
  // Surface Water Present Day
  {
    id: 'surfacewater-presentday-low',
    tileName: 'Surface_Water_Spatial_Planning_1_in_1000_Depths',
    sourceLayer: 'Surface Water Spatial Planning 1 in 1000 Depths',
    timeframe: ['presentday'],
    aep: ['low']
  },
  {
    id: 'surfacewater-presentday-medium',
    tileName: 'Surface_Water_Spatial_Planning_1_in_100_Depths',
    sourceLayer: 'Surface Water Spatial Planning 1 in 100 Depths',
    timeframe: ['presentday'],
    aep: ['medium']
  },
  {
    id: 'surfacewater-presentday-high',
    tileName: 'Surface_Water_Spatial_Planning_1_in_30_Depths',
    sourceLayer: 'Surface Water Spatial Planning 1 in 30 Depths',
    timeframe: ['presentday'],
    aep: ['high']
  },
  // Surface Water Climate Change
  {
    id: 'surfacewater-climatechange-low',
    tileName: 'Surface_Water_Spatial_Planning_1_in_1000_CCP1_Depths',
    sourceLayer: 'Surface Water Spatial Planning 1 in 1000 CCP1 Depths',
    timeframe: ['climatechange'],
    aep: ['low']
  },
  {
    id: 'surfacewater-climatechange-medium',
    tileName: 'Surface_Water_Spatial_Planning_1_in_100_CCP1_Depths',
    sourceLayer: 'Surface Water Spatial Planning 1 in 100 CCP1 Depths',
    timeframe: ['climatechange'],
    aep: ['medium']
  },
  {
    id: 'surfacewater-climatechange-high',
    tileName: 'Surface_Water_Spatial_Planning_1_in_30_CCP1_Depths',
    sourceLayer: 'Surface Water Spatial Planning 1 in 30 CCP1 Depths',
    timeframe: ['climatechange'],
    aep: ['high']
  },
]

export const surfaceWaterDatasets = ({ agolVectorTileUrl, layerNameSuffix }) =>
  swConfigs.flatMap((swConfig) => surfaceWaterDatasetGenerator({ agolVectorTileUrl, layerNameSuffix, ...swConfig }))

const surfaceWaterExtentsKeyStyle = {
  stroke: { outdoor: colours.nonFloodZoneLight, dark: colours.nonFloodZoneDark },
  fill: { outdoor: colours.nonFloodZoneLight, dark: colours.nonFloodZoneDark },
}

export const surfaceWaterExtentsKey = {
  id: 'surfacewater-extents-key',
  label: terms.labels.surfaceWater,
  showInKey: true,
  style: surfaceWaterExtentsKeyStyle,
  sublayers: [
    {
      id: 'extents150',
      label: terms.depth.extentsFull,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['extentsFull'] } }
    },
    {
      id: 'extents300',
      label: terms.depth.extentsOver150,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['extentsOver150'] } }
    },
    {
      id: 'extents600',
      label: terms.depth.extentsOver300,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['extentsOver300'] } }
    },
    {
      id: 'extents900',
      label: terms.depth.extentsOver600,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['extentsOver600'] } }
    },
    {
      id: 'extents1200',
      label: terms.depth.extentsOver900,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['extentsOver900'] } }
    },
    {
      id: 'extents2300',
      label: terms.depth.extentsOver1200,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['extentsOver1200'] } }
    },
    {
      id: 'extentsOver2300',
      label: terms.depth.extentsOver2300,
      showInKey: true,
      style: surfaceWaterExtentsKeyStyle,
      visibleWhen: { menu: { dataset: ['surfacewater'], depth: ['extentsOver2300'] } }
    }
  ]
}
