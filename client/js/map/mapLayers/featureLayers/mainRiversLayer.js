import { FloodMapFeatureLayer } from './floodMapFeatureLayer'
import { mapState } from '../../interactive-map-helpers/mapState.js'
import { colours } from '../../colours'

export class MainRiversLayer extends FloodMapFeatureLayer {
  constructor () {
    super({
      name: 'mainrivers',
      urlLayerName: 'Statutory_Main_River_Map',
      hasNonProdSuffix: false // river map uses same layer for non production and production
    })
  }

  get renderer () {
    const colour = mapState.isDark ? colours.mainRivers.default : colours.mainRivers.dark
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
