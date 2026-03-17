import { FloodMapFeatureLayer } from './floodMapFeatureLayer'
import { WaterStorageLayer } from './waterStorageLayer'
import { FloodDefenceLayer } from './floodDefenceLayer'
import { MainRiversLayer } from './mainRiversLayer'
import { mapState } from '../../interactive-map-helpers/mapState.js'

const featureLayers = [
  new FloodDefenceLayer(),
  new WaterStorageLayer(),
  new MainRiversLayer()
]

export const showActiveFeatureLayers = () => {
  featureLayers.forEach(featureLayer => {
    const layer = featureLayer.layer
    layer.visible = mapState.features.includes(featureLayer.name)
    layer.renderer = featureLayer.renderer
  })
}

export const hideAllFeatureLayers = () => {
  featureLayers.forEach(({ layer }) => (layer.visible = false))
}

export const addFeatureLayers = async (interactiveMap, defraMapConfig) => {
  interactiveMap.on('map:ready', async (mapProvider) => {
    mapState.isDark = mapProvider.mapStyleId === 'dark'
    await FloodMapFeatureLayer.initialise(defraMapConfig)
    featureLayers.forEach(featureLayer => mapProvider.map.add(featureLayer.layer))
    showActiveFeatureLayers()
  })
  document.addEventListener('fmp:featureschanged', () => {
    showActiveFeatureLayers()
  })
  interactiveMap.on('map:stylechange', async ({ mapStyleId }) => {
    mapState.isDark = mapStyleId === 'dark'
    showActiveFeatureLayers()
  })
}
