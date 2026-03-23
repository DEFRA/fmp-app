import { terms } from '../terms.js'
import { colours } from '../colours.js'
import { FloodMapLayer, FloodZoneCCLayer, SurfaceWaterLayer } from './index.js'

// surfacewater-climatechange-high-depthAll
// surfacewater-climatechange-high-alldepths
// surfacewater-climatechange-high-depth150

const surfaceWaterStyleLayerFilters = [
  ['depthAll', 'depth150', 'depth300', 'depth600', 'depth900', 'depth1200', 'depth2300', 'depthOver2300'],
  ['depthAll', 'depth150', 'depth300', 'depth600', 'depth900', 'depth1200', 'depth2300'],
  ['depthAll', 'depth150', 'depth300', 'depth600', 'depth900', 'depth1200'],
  ['depthAll', 'depth150', 'depth300', 'depth600', 'depth900'],
  ['depthAll', 'depth150', 'depth300', 'depth600'],
  ['depthAll', 'depth150', 'depth300'],
  ['depthAll', 'depth150']
]

const surfaceWaterWithDepthStyleLayersLow = [
  ['Surface Water Spatial Planning 1 in 1000 Depths/>2300mm/1', colours.nonFloodZoneDepthBands[0], surfaceWaterStyleLayerFilters[0]],
  ['Surface Water Spatial Planning 1 in 1000 Depths/1200-2300mm/1', colours.nonFloodZoneDepthBands[1], surfaceWaterStyleLayerFilters[1]],
  ['Surface Water Spatial Planning 1 in 1000 Depths/900-1200mm/1', colours.nonFloodZoneDepthBands[2], surfaceWaterStyleLayerFilters[2]],
  ['Surface Water Spatial Planning 1 in 1000 Depths/600-900mm/1', colours.nonFloodZoneDepthBands[3], surfaceWaterStyleLayerFilters[3]],
  ['Surface Water Spatial Planning 1 in 1000 Depths/300-600mm/1', colours.nonFloodZoneDepthBands[4], surfaceWaterStyleLayerFilters[4]],
  ['Surface Water Spatial Planning 1 in 1000 Depths/150-300mm/1', colours.nonFloodZoneDepthBands[5], surfaceWaterStyleLayerFilters[5]],
  ['Surface Water Spatial Planning 1 in 1000 Depths/<150mm/1', colours.nonFloodZoneDepthBands[6], surfaceWaterStyleLayerFilters[6]]
]

const surfaceWaterWithDepthStyleLayersMedium = [
  ['Surface Water Spatial Planning 1 in 100 Depths/>2300mm/1', colours.nonFloodZoneDepthBands[0], surfaceWaterStyleLayerFilters[0]],
  ['Surface Water Spatial Planning 1 in 100 Depths/1200-2300mm/1', colours.nonFloodZoneDepthBands[1], surfaceWaterStyleLayerFilters[1]],
  ['Surface Water Spatial Planning 1 in 100 Depths/900-1200mm/1', colours.nonFloodZoneDepthBands[2], surfaceWaterStyleLayerFilters[2]],
  ['Surface Water Spatial Planning 1 in 100 Depths/600-900mm/1', colours.nonFloodZoneDepthBands[3], surfaceWaterStyleLayerFilters[3]],
  ['Surface Water Spatial Planning 1 in 100 Depths/300-600mm/1', colours.nonFloodZoneDepthBands[4], surfaceWaterStyleLayerFilters[4]],
  ['Surface Water Spatial Planning 1 in 100 Depths/150-300mm/1', colours.nonFloodZoneDepthBands[5], surfaceWaterStyleLayerFilters[5]],
  ['Surface Water Spatial Planning 1 in 100 Depths/<150mm/1', colours.nonFloodZoneDepthBands[6], surfaceWaterStyleLayerFilters[6]]
]

const surfaceWaterWithDepthStyleLayersHigh = [
  ['Surface Water Spatial Planning 1 in 30 Depths/>2300mm/1', colours.nonFloodZoneDepthBands[0], surfaceWaterStyleLayerFilters[0]],
  ['Surface Water Spatial Planning 1 in 30 Depths/1200-2300mm/1', colours.nonFloodZoneDepthBands[1], surfaceWaterStyleLayerFilters[1]],
  ['Surface Water Spatial Planning 1 in 30 Depths/900-1200mm/1', colours.nonFloodZoneDepthBands[2], surfaceWaterStyleLayerFilters[2]],
  ['Surface Water Spatial Planning 1 in 30 Depths/600-900mm/1', colours.nonFloodZoneDepthBands[3], surfaceWaterStyleLayerFilters[3]],
  ['Surface Water Spatial Planning 1 in 30 Depths/300-600mm/1', colours.nonFloodZoneDepthBands[4], surfaceWaterStyleLayerFilters[4]],
  ['Surface Water Spatial Planning 1 in 30 Depths/150-300mm/1', colours.nonFloodZoneDepthBands[5], surfaceWaterStyleLayerFilters[5]],
  ['Surface Water Spatial Planning 1 in 30 Depths/<150mm/1', colours.nonFloodZoneDepthBands[6], surfaceWaterStyleLayerFilters[6]]
]

const surfaceWaterCCWithDepthStyleLayersLow = [
  ['Surface Water Spatial Planning 1 in 1000 CCP1 Depths/>2300mm/1', colours.nonFloodZoneDepthBands[0], surfaceWaterStyleLayerFilters[0]],
  ['Surface Water Spatial Planning 1 in 1000 CCP1 Depths/1200-2300mm/1', colours.nonFloodZoneDepthBands[1], surfaceWaterStyleLayerFilters[1]],
  ['Surface Water Spatial Planning 1 in 1000 CCP1 Depths/900-1200mm/1', colours.nonFloodZoneDepthBands[2], surfaceWaterStyleLayerFilters[2]],
  ['Surface Water Spatial Planning 1 in 1000 CCP1 Depths/600-900mm/1', colours.nonFloodZoneDepthBands[3], surfaceWaterStyleLayerFilters[3]],
  ['Surface Water Spatial Planning 1 in 1000 CCP1 Depths/300-600mm/1', colours.nonFloodZoneDepthBands[4], surfaceWaterStyleLayerFilters[4]],
  ['Surface Water Spatial Planning 1 in 1000 CCP1 Depths/150-300mm/1', colours.nonFloodZoneDepthBands[5], surfaceWaterStyleLayerFilters[5]],
  ['Surface Water Spatial Planning 1 in 1000 CCP1 Depths/<150mm/1', colours.nonFloodZoneDepthBands[6], surfaceWaterStyleLayerFilters[6]]
]

const surfaceWaterCCWithDepthStyleLayersMedium = [
  ['Surface Water Spatial Planning 1 in 100 CCP1 Depths/>2300mm/1', colours.nonFloodZoneDepthBands[0], surfaceWaterStyleLayerFilters[0]],
  ['Surface Water Spatial Planning 1 in 100 CCP1 Depths/1200-2300mm/1', colours.nonFloodZoneDepthBands[1], surfaceWaterStyleLayerFilters[1]],
  ['Surface Water Spatial Planning 1 in 100 CCP1 Depths/900-1200mm/1', colours.nonFloodZoneDepthBands[2], surfaceWaterStyleLayerFilters[2]],
  ['Surface Water Spatial Planning 1 in 100 CCP1 Depths/600-900mm/1', colours.nonFloodZoneDepthBands[3], surfaceWaterStyleLayerFilters[3]],
  ['Surface Water Spatial Planning 1 in 100 CCP1 Depths/300-600mm/1', colours.nonFloodZoneDepthBands[4], surfaceWaterStyleLayerFilters[4]],
  ['Surface Water Spatial Planning 1 in 100 CCP1 Depths/150-300mm/1', colours.nonFloodZoneDepthBands[5], surfaceWaterStyleLayerFilters[5]],
  ['Surface Water Spatial Planning 1 in 100 CCP1 Depths/<150mm/1', colours.nonFloodZoneDepthBands[6], surfaceWaterStyleLayerFilters[6]]
]

const surfaceWaterCCWithDepthStyleLayersHigh = [
  ['Surface Water Spatial Planning 1 in 30 CCP1 Depths/>2300mm/1', colours.nonFloodZoneDepthBands[0], surfaceWaterStyleLayerFilters[0]],
  ['Surface Water Spatial Planning 1 in 30 CCP1 Depths/1200-2300mm/1', colours.nonFloodZoneDepthBands[1], surfaceWaterStyleLayerFilters[1]],
  ['Surface Water Spatial Planning 1 in 30 CCP1 Depths/900-1200mm/1', colours.nonFloodZoneDepthBands[2], surfaceWaterStyleLayerFilters[2]],
  ['Surface Water Spatial Planning 1 in 30 CCP1 Depths/600-900mm/1', colours.nonFloodZoneDepthBands[3], surfaceWaterStyleLayerFilters[3]],
  ['Surface Water Spatial Planning 1 in 30 CCP1 Depths/300-600mm/1', colours.nonFloodZoneDepthBands[4], surfaceWaterStyleLayerFilters[4]],
  ['Surface Water Spatial Planning 1 in 30 CCP1 Depths/150-300mm/1', colours.nonFloodZoneDepthBands[5], surfaceWaterStyleLayerFilters[5]],
  ['Surface Water Spatial Planning 1 in 30 CCP1 Depths/<150mm/1', colours.nonFloodZoneDepthBands[6], surfaceWaterStyleLayerFilters[6]]
]

const vtLayers = [
  new FloodZoneCCLayer(),
  new FloodMapLayer({
    name: 'Flood_Zones_2_and_3_Rivers_and_Sea',
    q: 'floodzones-presentday',
    styleLayers: [
      ['Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1', colours.floodZone2],
      ['Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1', colours.floodZone3]
    ]
  }),
  new SurfaceWaterLayer({
    name: 'Surface_Water_Spatial_Planning_1_in_1000_Depths',
    q: 'swpdlr',
    layerVisibilityFilter: ['surfacewater', 'presentday', 'low'],
    styleLayers: surfaceWaterWithDepthStyleLayersLow,
    likelihoodchanceLabel: terms.likelihoodchance.swLow
  }),
  new SurfaceWaterLayer({
    name: 'Surface_Water_Spatial_Planning_1_in_100_Depths',
    q: 'swpdmr',
    layerVisibilityFilter: ['surfacewater', 'presentday', 'medium'],
    styleLayers: surfaceWaterWithDepthStyleLayersMedium,
    likelihoodchanceLabel: terms.likelihoodchance.swMedium
  }),
  new SurfaceWaterLayer({
    name: 'Surface_Water_Spatial_Planning_1_in_30_Depths',
    q: 'swpdhr',
    layerVisibilityFilter: ['surfacewater', 'presentday', 'high'],
    styleLayers: surfaceWaterWithDepthStyleLayersHigh,
    likelihoodchanceLabel: terms.likelihoodchance.swHigh
  }),
  new SurfaceWaterLayer({
    name: 'Surface_Water_Spatial_Planning_1_in_1000_CCP1_Depths',
    q: 'swcllr',
    layerVisibilityFilter: ['surfacewater', 'climatechange', 'low'],
    styleLayers: surfaceWaterCCWithDepthStyleLayersLow,
    likelihoodchanceLabel: terms.likelihoodchance.swLow
  }),
  new SurfaceWaterLayer({
    name: 'Surface_Water_Spatial_Planning_1_in_100_CCP1_Depths',
    q: 'swclmr',
    layerVisibilityFilter: ['surfacewater', 'climatechange', 'medium'],
    styleLayers: surfaceWaterCCWithDepthStyleLayersMedium,
    likelihoodchanceLabel: terms.likelihoodchance.swMedium
  }),
  new SurfaceWaterLayer({
    name: 'Surface_Water_Spatial_Planning_1_in_30_CCP1_Depths',
    q: 'swclhr',
    layerVisibilityFilter: ['surfacewater', 'climatechange', 'high'],
    styleLayers: surfaceWaterCCWithDepthStyleLayersHigh,
    likelihoodchanceLabel: terms.likelihoodchance.swHigh
  })
  // Retaining this commented out, as will inevitably be reinstated and
  // want to keep it in mind during any refactors
  // {
  //   name: 'Rivers_1_in_30_Sea_1_in_30_Defended',
  //   q: '', // Implies disabled for now
  //   styleLayers: [['Rivers 1 in 30 Sea 1 in 30 Defended/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
  //   additionalInfo: terms.additionalInfo.rsHighDefended
  // },
  // {
  //   name: 'Rivers_1_in_30_Sea_1_in_30_Defended_Extents',
  //   q: 'rsdpdhr',
  //   styleLayers: [['Rivers 1 in 30 Sea 1 in 30 Defended Extents/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
  //   additionalInfo: terms.additionalInfo.rsHighDefended
  // },
  // {
  //   name: 'Rivers_1_in_100_Sea_1_in_200_Defended_Extents',
  //   q: 'rsdpdmr',
  //   styleLayers: [['Rivers 1 in 100 Sea 1 in 200 Defended Extents/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
  //   additionalInfo: terms.additionalInfo.rsMedium
  // },
  // {
  //   name: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Extents',
  //   q: 'rsupdmr',
  //   styleLayers: [['Rivers 1 in 100 Sea 1 in 200 Undefended Extents/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
  //   additionalInfo: terms.additionalInfo.rsMedium
  // },
  // {
  //   name: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Extents',
  //   q: 'rsdpdlr',
  //   styleLayers: [['Rivers 1 in 1000 Sea 1 in 1000 Defended Extents/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsLow,
  //   additionalInfo: terms.additionalInfo.rsLow
  // },
  // {
  //   name: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Extents',
  //   q: 'rsupdlr',
  //   styleLayers: [['Rivers 1 in 1000 Sea 1 in 1000 Undefended Extents/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsLow,
  //   additionalInfo: terms.additionalInfo.rsLow
  // },
  // {
  //   name: 'Rivers_1_in_30_Sea_1_in_30_Defended_CCP1',
  //   q: '', // Implies disabled for now
  //   styleLayers: [['Rivers 1 in 30 Sea 1 in 30 Defended CCP1/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
  //   additionalInfo: terms.additionalInfo.rsHighDefended
  // },
  // {
  //   name: 'Rivers_1_in_30_Sea_1_in_30_Defended_Extents_CCP1',
  //   q: 'rsdclhr',
  //   styleLayers: [['Rivers 1 in 30 Sea 1 in 30 Defended Extents CCP1/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
  //   additionalInfo: terms.additionalInfo.rsHighDefended
  // },
  // {
  //   name: 'Rivers_1_in_100_Sea_1_in_200_Defended_Extents_CCP1',
  //   q: 'rsdclmr',
  //   styleLayers: [['Rivers 1 in 100 Sea 1 in 200 Defended Extents CCP1/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
  //   additionalInfo: terms.additionalInfo.rsMedium
  // },
  // {
  //   name: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Extents_CCP1',
  //   q: 'rsuclmr',
  //   styleLayers: [['Rivers 1 in 100 Sea 1 in 200 Undefended Extents CCP1/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
  //   additionalInfo: terms.additionalInfo.rsMedium
  // },
  // {
  //   name: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Extents_CCP1',
  //   q: 'rsdcllr',
  //   styleLayers: [['Rivers 1 in 1000 Sea 1 in 1000 Defended Extents CCP1/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsLow,
  //   additionalInfo: terms.additionalInfo.rsLow
  // },
  // {
  //   name: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Extents_CCP1',
  //   q: 'rsucllr',
  //   styleLayers: [['Rivers 1 in 1000 Sea 1 in 1000 Undefended Extents CCP1/1', colours.nonFloodZone]],
  //   likelihoodchanceLabel: terms.likelihoodchance.rsLow,
  //   additionalInfo: terms.additionalInfo.rsLow
  // },
]
export { vtLayers }
