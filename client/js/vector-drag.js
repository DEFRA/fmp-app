const ol = require('openlayers')

function VectorDrag () {
  ol.interaction.Pointer.call(this, {
    handleDownEvent: VectorDrag.prototype.handleDownEvent,
    handleDragEvent: VectorDrag.prototype.handleDragEvent,
    handleMoveEvent: VectorDrag.prototype.handleMoveEvent,
    handleUpEvent: VectorDrag.prototype.handleUpEvent
  })

  this.coordinate = null
  this.cursor = 'pointer'
  this.feature = null
  this.previouscursor = null

  // Fix for multiple features movement
  this.features = []
}

ol.inherits(VectorDrag, ol.interaction.Pointer)

VectorDrag.prototype.handleDownEvent = function (evt) {
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

VectorDrag.prototype.handleDragEvent = function (evt) {
  const deltaX = evt.coordinate[0] - this.coordinate[0]
  const deltaY = evt.coordinate[1] - this.coordinate[1]

  this.features.forEach(function (feature) {
    feature.getGeometry().translate(deltaX, deltaY)
  })

  this.coordinate[0] = evt.coordinate[0]
  this.coordinate[1] = evt.coordinate[1]
}

VectorDrag.prototype.handleMoveEvent = function (evt) {
  if (this.cursor) {
    const map = evt.map
    const feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature) {
        return feature
      })
    const element = evt.map.getTargetElement()
    if (feature) {
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

VectorDrag.prototype.handleUpEvent = function () {
  this.coordinate = null
  this.feature = null
  this.features = []
  return false
}

module.exports = VectorDrag
