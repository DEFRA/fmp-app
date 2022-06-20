const Feature = require('ol/Feature').default
const Point = require('ol/geom/Point').default
const Collection = require('ol/Collection').default

class CartesianRange {
  constructor (topLeft, bottomRight) {
    this.topLeft = topLeft
    this.bottomRight = bottomRight
  }

  containsRange (topLeft, bottomRight) {
    return ((this.topLeft[0] <= topLeft[0] &&
      this.topLeft[1] <= topLeft[1]) &&
      (this.bottomRight[0] >= bottomRight[0] &&
        this.bottomRight[1] >= bottomRight[1]))
  }
}

class CartesianSnapCollection {
  constructor () {
    this.snapFeatures = new Collection([])
    this.addedRanges = []
  }

  hasRange (topLeft, bottomRight) {
    return Boolean(this.addedRanges.find(range => range.containsRange(topLeft, bottomRight)))
  }

  setExtents (topLeft, bottomRight) {
    if (this.hasRange(topLeft, bottomRight)) {
      return
    }
    const newFeatures = []
    for (let x = topLeft[0]; x <= bottomRight[0]; x++) {
      for (let y = topLeft[1]; y <= bottomRight[1]; y++) {
        if (!this.hasRange([x, y], [x, y])) {
          newFeatures.push(this.add(x, y))
        }
      }
    }
    if (newFeatures.length) {
      this.snapFeatures = this.snapFeatures.extend(newFeatures)
    }
    this.addedRanges.push(new CartesianRange(topLeft, bottomRight))
  }

  add (x, y) {
    return new Feature({
      geometry: (new Point([x, y]))
    })
  }
}

module.exports = { CartesianSnapCollection, CartesianRange }
