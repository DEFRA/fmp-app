import { FloodMapFeatureLayer } from './floodMapFeatureLayer'
import { mapState } from '../../interactive-map-helpers/mapState.js'
import { colours } from '../../colours'

export class WaterStorageLayer extends FloodMapFeatureLayer {
  constructor () {
    super({
      name: 'waterstorage',
      urlLayerName: 'Flood_Storage_Areas',
    })
  }

  get renderer () {
    const color = mapState.isDark ? colours.waterStorageAreas.default : colours.waterStorageAreas.dark
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
