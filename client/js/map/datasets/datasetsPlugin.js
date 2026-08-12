import createDatasetsPlugin from '@defra/interactive-map/plugins/datasets'
import { surfaceWaterDatasets, surfaceWaterExtentsKey } from './surfaceWater.js'
import { floodZonesDatasets } from './floodZones.js'
import { featureLayers } from './featureLayers.js'
import { menu } from './datasetsMenu.js'
import { mapState } from '../interactive-map-helpers/mapState.js'

const esriStyleLayerIdToInfoPanelReducer = (datasets) => {
  return datasets.reduce((styleToValuesMap, dataset) => {
    if (dataset.sublayers) {
      dataset.sublayers.forEach((sublayer) => {
        if (sublayer.infoPanelData) {
          styleToValuesMap[sublayer.esriStyleLayerId] = sublayer.infoPanelData
        }
      })
    }
    return styleToValuesMap
  }, {})
}

export const initialiseDatasetsPlugin = ({ agolServiceUrl, agolVectorTileUrl, layerNameSuffix }) => {
  const datasets = [
    ...floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix }),
    surfaceWaterExtentsKey,
    ...surfaceWaterDatasets({ agolVectorTileUrl, layerNameSuffix }),
    ...featureLayers(agolServiceUrl, layerNameSuffix),
  ]
  mapState.styleToValuesMap = esriStyleLayerIdToInfoPanelReducer(datasets)

  const datasetsPlugin = createDatasetsPlugin({
    manifest: {
      panels: [{
        id: 'datasetsLayers',
        desktop: { open: true, slot: 'side', width: '280px', dismissible: false },
        tablet: { slot: 'side', width: '280px', modal: true }
      }],
      buttons: [{
        id: 'datasetsLayers',
        excludeWhen: ({ appState }) => (appState?.breakpoint === 'desktop'),
      }, {
        id: 'datasetsKey',
        mobile: { slot: 'top-left', showLabel: true, order: 3 }
      }]
    },
    globals: {
      opacityMode: 'global',
      opacity: 0.75,
      visible: true
    },
    datasets,
    menu
  })
  datasetsPlugin.ready = false
  return datasetsPlugin
}
