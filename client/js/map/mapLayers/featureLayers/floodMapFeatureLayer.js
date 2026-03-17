import FeatureLayer from '@arcgis/core/layers/FeatureLayer'

export class FloodMapFeatureLayer {
  constructor ({ name, urlLayerName, hasNonProdSuffix = true }) {
    this.name = name
    this.urlLayerName = urlLayerName
    this.hasNonProdSuffix = hasNonProdSuffix
  }

  static nonProdSuffix = '' // eg _NON_PRODUCTION
  static agolServiceUrl = ''
  static initialise (defraMapConfig) {
    FloodMapFeatureLayer.nonProdSuffix = defraMapConfig.featureLayerNameSuffix
    FloodMapFeatureLayer.agolServiceUrl = defraMapConfig.agolServiceUrl
  }

  get url () {
    const nonProdSuffix = this.hasNonProdSuffix ? FloodMapFeatureLayer.nonProdSuffix : ''
    return `${FloodMapFeatureLayer.agolServiceUrl}/${this.urlLayerName + nonProdSuffix}/FeatureServer`
  }

  get renderer () {
    return ''
  }

  get layer () {
    this._layer = this._layer || new FeatureLayer({
      id: this.name,
      url: this.url,
      renderer: this.renderer,
      visible: false
    })
    return this._layer
  }
}
