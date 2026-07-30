import createDatasetsPlugin from '@defra/interactive-map/plugins/datasets'
import { surfaceWaterDatasets, surfaceWaterExtentsKey } from './surfaceWater.js'
import { floodZonesDatasets } from './floodZones.js'
import { featureLayers } from './featureLayers.js'
import { menu } from './datasetsMenu.js'

export const datasetsPlugin = ({ agolServiceUrl, agolVectorTileUrl, layerNameSuffix }) => {
  const datasets = [
    ...floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix }),
    surfaceWaterExtentsKey,
    ...surfaceWaterDatasets({ agolVectorTileUrl, layerNameSuffix }),
    ...featureLayers(agolServiceUrl, layerNameSuffix),
  ]

  return createDatasetsPlugin({
    manifest: {
      panels: [{
        id: 'datasetsLayers',
        desktop: { open: true, slot: 'side', width: '280px', dismissible: false },
        tablet: { slot: 'side', width: '280px', modal: true }
      }],
      buttons: [
        {
          id: 'datasetsLayers',
          excludeWhen: ({ appState }) => (appState?.breakpoint === 'desktop'),
        }
      ]
    },
    globals: {
      opacityMode: 'global',
      opacity: 0.75,
      visible: true
    },
    datasets,
    menu
  })
}
