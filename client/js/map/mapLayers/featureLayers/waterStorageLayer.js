import { FloodMapFeatureLayer } from './floodMapFeatureLayer'
import { mapState } from '../../interactive-map-helpers/mapState.js'
import { colours, LIGHT_INDEX, DARK_INDEX } from '../../colours'

export class WaterStorageLayer extends FloodMapFeatureLayer {
  constructor () {
    super({
      name: 'waterstorage',
      urlLayerName: 'Flood_Storage_Areas',
    })
  }

  get renderer () {
    const color = mapState.isDark ? colours.waterStorageAreas[DARK_INDEX] : colours.waterStorageAreas[LIGHT_INDEX]
    return {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        style: 'diagonal-cross',
        color,
        outline: { color, width: 1 }
      }
    }
  }
}
