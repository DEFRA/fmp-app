import { FloodMapLayer } from './floodMapLayer.js'
import { colours } from '../colours.js'

class SurfaceWaterLayer extends FloodMapLayer {
  getFillColour (paintProperties) {
    const { segments } = this.mapState
    if (segments.includes('depthAll')) {
      return paintProperties[this.isDark ? 1 : 0]
    }
    return colours.nonFloodZone[this.isDark ? 1 : 0]
  }

  updateOpacity () {
    // Surface Water layers require the opacity to be set at the styleLayer level
    // but other's require it to be set at the vectorTile level (to avoid an issue)
    this.setStyleProperties()
  }
}

export { SurfaceWaterLayer }
