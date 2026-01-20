import { FloodMapLayer } from './floodMapLayer.js'
import { colours } from '../colours.js'

const depthKeyValues = {
  depth150: '<150mm',
  depth300: '150-300mm',
  depth600: '300-600mm',
  depth900: '600-900mm',
  depth1200: '900-1200mm',
  depth2300: '1200-2300mm',
  depthOver2300: '>2300mm'
}

class SurfaceWaterLayer extends FloodMapLayer {
  getFillColour (paintProperties) {
    const { segments } = this.mapState
    if (segments.includes('depthAll')) {
      return paintProperties[this.isDark ? 1 : 0]
    }
    return colours.nonFloodZone[this.isDark ? 1 : 0]
  }

  _visibleDepthBands = {}

  setVisibleDepthBands (visibleSegments) {
    let found = visibleSegments.includes('depthAll')
    this._visibleDepthBands = Object.keys(depthKeyValues).reduce((values, depthBand) => {
      found = found || visibleSegments.includes(depthBand)
      values[depthKeyValues[depthBand]] = found
      return values
    }, this._visibleDepthBands)
  }

  get visibleDepthBands () {
    return this._visibleDepthBands
  }

  isDepthVisible (depthBand) {
    return this.visibleDepthBands[depthBand]
  }

  isStyleLayerIdVisible (layerId) {
    const depthBand = layerId?.split('/')?.[1]
    return this.isDepthVisible(depthBand)
  }

  isStyleSegmentVisible (segmentsToMatch) {
    const { segments } = this.mapState
    if (segmentsToMatch) {
      const isVisible = segmentsToMatch.find(segment => segments.includes(segment)) !== undefined
      if (isVisible) {
        this.setVisibleDepthBands(segments)
      }
      return isVisible
    }
    return true
  }

  updateOpacity () {
    // Surface Water layers require the opacity to be set at the styleLayer level
    // but other's require it to be set at the vectorTile level (to avoid an issue)
    this.setStyleProperties()
    this.setStyleProperties()
  }
}

export { SurfaceWaterLayer }
