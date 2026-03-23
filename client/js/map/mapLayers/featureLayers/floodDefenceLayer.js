import { FloodMapFeatureLayer } from './floodMapFeatureLayer'
import { mapState } from '../../interactive-map-helpers/mapState.js'
import { colours, LIGHT_INDEX, DARK_INDEX } from '../../colours'

export class FloodDefenceLayer extends FloodMapFeatureLayer {
  constructor () {
    super({ name: 'flooddefence', urlLayerName: 'Defences', })
  }

  get renderer () {
    const colour = mapState.isDark ? colours.floodDefences[DARK_INDEX] : colours.floodDefences[LIGHT_INDEX]
    return {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        width: '3px',
        color: colour
      }
    }
  }
}
