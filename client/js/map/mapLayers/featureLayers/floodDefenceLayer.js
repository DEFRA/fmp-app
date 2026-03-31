import { FloodMapFeatureLayer } from './floodMapFeatureLayer'
import { mapState } from '../../interactive-map-helpers/mapState.js'
import { COLOURS } from '../../colours'

export class FloodDefenceLayer extends FloodMapFeatureLayer {
  constructor () {
    super({ name: 'flooddefence', urlLayerName: 'Defences', })
  }

  get renderer () {
    const colour = mapState.isDark ? COLOURS.floodDefences.default : COLOURS.floodDefences.dark
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
