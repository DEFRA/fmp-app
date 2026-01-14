import { lazyLoadModules } from './lazyLoadModules'
class FloodMapLayer {
  constructor ({ name, q, styleLayers, layerVisibilityFilter, likelihoodchanceLabel, logStyles }) {
    this.name = name
    this.q = q
    this.styleLayers = styleLayers
    this.layerVisibilityFilter = layerVisibilityFilter
    this.likelihoodchanceLabel = likelihoodchanceLabel
    this.logStyles = logStyles
  }

  static visibleLayer
  static _opacity = 0.75

  static set opacity (opacity) {
    FloodMapLayer._opacity = opacity
    if (FloodMapLayer.visibleLayer) {
      FloodMapLayer.visibleLayer?.updateOpacity()
    }
  }

  static get opacity () {
    return FloodMapLayer._opacity
  }

  static injectedModules = {}

  static get modules () {
    return FloodMapLayer.injectedModules
  }

  static async initialise ({ mapState, config }) {
    if (mapState) {
      FloodMapLayer.mapState = mapState
    }
    if (!FloodMapLayer.injectedModules.VectorTileLayer) {
      FloodMapLayer.injectedModules = await lazyLoadModules()
    }
    if (config) {
      FloodMapLayer.config = config
    }
  }

  get mapState () {
    return FloodMapLayer.mapState
  }

  get isDark () {
    return FloodMapLayer.mapState?.isDark
  }

  getVectorTileUrl (name) {
    return `${FloodMapLayer.config.agolVectorTileUrl}/${name + FloodMapLayer.config.layerNameSuffix}/VectorTileServer`
  }

  get vectorTileUrl () {
    return this.getVectorTileUrl(this.name)
  }

  get allLayers () {
    return this.vectorTileLayer.allLayers || [this.vectorTileLayer]
  }

  set visible (visible) {
    this.vectorTileLayer.visible = visible
    if (visible) {
      FloodMapLayer.visibleLayer = this
    }
    if (visible) {
      this.updateOpacity()
      this.setStyleProperties()
    }
  }

  get visible () {
    return this.vectorTileLayer.visible
  }

  addToMap (map) {
    const { VectorTileLayer } = FloodMapLayer.modules
    this.vectorTileLayer = new VectorTileLayer({
      id: this.name,
      url: this.vectorTileUrl,
      opacity: 1,
      visible: false
    })
    map.add(this.vectorTileLayer)
  }

  checkLayerVisibility (_segments) {
    const { segments } = this.mapState
    const segmentsToMatch = this.layerVisibilityFilter
    if (segmentsToMatch) {
      return segmentsToMatch.every(segment => segments.includes(segment))
    }
    return segments.join('') === this.q
  }

  isStyleLayerVisible (segmentsToMatch) {
    const { segments } = this.mapState
    if (segmentsToMatch) {
      return segmentsToMatch.find(segment => segments.includes(segment)) !== undefined
    }
    return true
  }

  getFillColour (paintProperties) {
    return paintProperties[this.isDark ? 1 : 0]
  }

  updateOpacity () {
    this.vectorTileLayer.opacity = FloodMapLayer.opacity
  }

  setStyleProperties () {
    if (this.logStyles) {
      this.logStyleLayers()
    }
    const allLayers = this.vectorTileLayer.allLayers || [this.vectorTileLayer]
    allLayers.forEach((vectorTileLayer) => {
      this.styleLayers.forEach(([styleLayerName, paintProperties, styleLayerFilters]) => {
        const layerPaintProperties = vectorTileLayer.getPaintProperties(styleLayerName)
        if (layerPaintProperties) {
          layerPaintProperties['fill-color'] = this.getFillColour(paintProperties)
          vectorTileLayer.setPaintProperties(styleLayerName, layerPaintProperties)
          if (styleLayerFilters) {
            layerPaintProperties['fill-opacity'] = this.isStyleLayerVisible(styleLayerFilters) ? FloodMapLayer.opacity : 0
          }
        }
      })
    })
  }

  // Set this.logStyles to true to dump the styleLayers for each vector layer
  // They don't seem to be defined anywhere server side, so Paul is anxious that
  // they may change when new layers are published.
  logStyleLayer (vectorTileLayer) {
    const { styleRepository = {} } = vectorTileLayer
    const { layers: styleLayers = [] } = styleRepository
    styleLayers.forEach((styleLayer) => {
      console.log(styleLayer.id)
    })
  }

  logStyleLayers () {
    console.log('\n', this.name, 'styles:')
    this.logStyleLayer(this.vectorTileLayer)
    this.logStyles = false // stop it happening lots of times
  }
}

export { FloodMapLayer }
