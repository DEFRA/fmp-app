import { FloodMapFeatureLayer } from './floodMapFeatureLayer'
import { mapState } from '../../interactive-map-helpers/mapState.js'
import { colours } from '../../colours'

export class FloodDefenceLayer extends FloodMapFeatureLayer {
  constructor () {
    super({ name: 'flooddefence', urlLayerName: 'Defences', })
  }

  get renderer () {
    const colour = mapState.isDark ? colours.floodDefences.default : colours.floodDefences.dark
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
