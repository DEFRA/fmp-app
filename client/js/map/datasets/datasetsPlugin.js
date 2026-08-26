import createDatasetsPlugin from '@defra/interactive-map/plugins/datasets'
import { surfaceWaterDatasets, surfaceWaterExtentsKey } from './surfaceWater.js'
import { floodZonesDatasets } from './floodZones.js'
import { featureLayers } from './featureLayers.js'
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
    globals: {
      opacityMode: 'global',
      opacity: 0.75,
      visible: true
    },
    hasMenu: false,
    datasets
  })
  datasetsPlugin.ready = false
  return datasetsPlugin
}
