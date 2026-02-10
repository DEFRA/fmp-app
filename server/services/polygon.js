const { bbox } = require('@turf/bbox')
const { IndexedShapeData } = require('./indexedShapeData.js')

module.exports = class Polygon {
  constructor (polygonArray) {
    this.turfPolygon = polygonArray
  }

  get turfPolygon () {
    return this._turfPolygon
  }

  set turfPolygon (polygon) {
    this._turfPolygon = { type: 'Polygon', coordinates: [polygon] }
    this._turfPolygonBbox = bbox(this._turfPolygon)
    this._polygonXYIndexPoints = IndexedShapeData.getXYIndexPoints(this._turfPolygonBbox)
  }

  get boundingBox () {
    return this._turfPolygonBbox
  }

  get xyIndexPoints () {
    return this._polygonXYIndexPoints
  }

  get coordinates () {
    return this._turfPolygon.coordinates
  }
}
