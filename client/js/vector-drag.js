const Pointer = require('ol/interaction/Pointer').default

class VectorDrag extends Pointer {
  constructor () {
    super()
    this.coordinate = null
    this.cursor = 'pointer'
    this.feature = null
    this.previouscursor = null

    // Fix for multiple features movement
    this.features = []
  }

  handleDownEvent (evt) {
    const map = evt.map

    const features = []

    const feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature) {
        return feature
      })

    if (feature) {
      this.coordinate = evt.coordinate
      this.feature = feature
      map.getLayers().forEach(function (layer) {
        if (layer.getProperties().ref === 'centre') {
          layer.getSource().getFeatures().forEach(function (feature) {
            features.push(feature)
          })
        }
      })
    }

    if (features.length > 0) {
      this.features = features
    }

    return !!feature
  }

  handleDragEvent (evt) {
    const deltaX = evt.coordinate[0] - this.coordinate[0]
    const deltaY = evt.coordinate[1] - this.coordinate[1]

    this.features.forEach(function (feature) {
      const geometry = feature.getGeometry()
      if (geometry.getType() !== 'Polygon') { // FCRM-3665 disable dragging polygons
        geometry.translate(deltaX, deltaY)
      }
    })

    this.coordinate[0] = evt.coordinate[0]
    this.coordinate[1] = evt.coordinate[1]
  }

  handleMoveEvent (evt) {
    if (this.cursor) {
      const map = evt.map
      const feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
          return feature
        })
      const element = evt.map.getTargetElement()
      const geometry = feature ? feature.getGeometry() : undefined
      if (feature && geometry.getType() !== 'Polygon') { // FCRM-3665 stop the icon changing implying polygons can be dragged
        if (element.style.cursor !== this.cursor) {
          this.previouscursor = element.style.cursor
          element.style.cursor = this.cursor
        }
      } else if (this.previouscursor !== null) {
        element.style.cursor = this.previouscursor
        this.previouscursor = null
      }
    }
  }

  handleUpEvent () {
    this.coordinate = null
    this.feature = null
    this.features = []
    return false
  }
}

module.exports = VectorDrag
