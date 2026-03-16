import { FloodMapLayer } from './floodMapLayer.js'
import { FloodZoneCCLayer } from './floodZoneCCLayer.js'
import { SurfaceWaterLayer } from './surfaceWaterLayer.js'
import { vtLayers } from './vtLayers.js'
import { mapState } from '../interactive-map-helpers/mapState.js'

const setLayerVisibility = () => {
  vtLayers.forEach(vtLayer => (vtLayer.visible = vtLayer.checkLayerVisibility()))
}

const attachLayers = (interactiveMap, defraMapConfig) => {
  interactiveMap.on('map:ready', async (mapProvider) => {
    await FloodMapLayer.initialise({
      mapState,
      config: defraMapConfig
    })
    vtLayers.forEach(vtLayer => vtLayer.addToMap(mapProvider.map))
    setLayerVisibility()
  })
  document.addEventListener('fmp:datasetchanged', () => {
    setLayerVisibility()
  })
}

export { FloodMapLayer, FloodZoneCCLayer, SurfaceWaterLayer, attachLayers, vtLayers }
