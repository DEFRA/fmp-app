import { FloodMapLayer } from './floodMapLayer.js'
import { FloodZoneCCLayer } from './floodZoneCCLayer.js'
import { SurfaceWaterLayer } from './surfaceWaterLayer.js'
import { vtLayers } from './vtLayers.js'
import { mapState } from '../interactive-map-helpers/mapState.js'

const showActiveLayers = () => {
  vtLayers.forEach(vtLayer => (vtLayer.visible = vtLayer.checkLayerVisibility()))
}

const hideAllLayers = () => {
  vtLayers.forEach(vtLayer => (vtLayer.visible = false))
}

const attachLayers = (interactiveMap, defraMapConfig) => {
  interactiveMap.on('map:ready', async (mapProvider) => {
    await FloodMapLayer.initialise({
      mapState,
      config: defraMapConfig
    })
    vtLayers.forEach(vtLayer => vtLayer.addToMap(mapProvider.map))
    showActiveLayers()
  })
  document.addEventListener('fmp:datasetchanged', () => {
    showActiveLayers()
  })
}

export { FloodMapLayer, FloodZoneCCLayer, SurfaceWaterLayer, attachLayers, vtLayers, hideAllLayers, showActiveLayers }
