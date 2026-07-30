import { FloodMapLayer } from './floodMapLayer.js'
import { colours } from '../colours.js'

// These are the depth bands that are used in the surface water layer's style layer ids
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

  // Sets a true/false on all items in _visibleDepthBands
  // which is keyed by the values in depthKeyValues
  setVisibleDepthBands (visibleSegments) {
    let found = visibleSegments.includes('depthAll')
    this._visibleDepthBands = Object.keys(depthKeyValues).reduce((values, depthBand) => {
      // Once a visible depth is found, all higher depths will also be visible so they
      // will be set to true too.
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
    // Extract the depthBand from the active (hovered over) style layerId
    const depthBand = layerId?.split('/')?.[1]
    // check if it is visible
    return this.isDepthVisible(depthBand)
  }

  isStyleSegmentVisible (segmentsToMatch) {
    const { segments } = this.mapState
    return segmentsToMatch.find(segment => segments.includes(segment)) !== undefined
  }

  checkLayerVisibility () {
    const { segments } = this.mapState
    const segmentsToMatch = this.layerVisibilityFilter
    const isVisible = segmentsToMatch.every(segment => segments.includes(segment))
    if (isVisible) {
      // When we set the layer to visible, we do an extra call
      // to toggle the visibility of the depthBands - which is dependent on
      // the 'segments' that are active in the MC.
      // the segments are visible in the url - and essential match which
      // radio buttons we have selected.
      this.setVisibleDepthBands(segments)
    }
    return isVisible
  }

  updateOpacity () {
    // Surface Water layers require the opacity to be set at the styleLayer level
    // but other's require it to be set at the vectorTile level (to avoid an issue)
    this.setStyleProperties()
    this.setStyleProperties()
  }
}

export { SurfaceWaterLayer }
