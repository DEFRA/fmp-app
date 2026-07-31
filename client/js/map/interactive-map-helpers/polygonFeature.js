import { getQueryParam, setQueryParam } from './queryParams.js'
import { checkParamsForPolygon, encodePolygon } from '../../../../server/services/shape-utils.js'

const getPolygonFromUrl = () => {
  try {
    const encodedPolygon = getQueryParam('encodedPolygon')
    const queryStringPolygon = getQueryParam('polygon')
    if (!(encodedPolygon || queryStringPolygon)) {
      return null
    }
    const { polygon: polygonString } = checkParamsForPolygon({ encodedPolygon, polygon: queryStringPolygon, encode: false })
    return [JSON.parse(polygonString)]
  } catch (_error) {
    return null
  }
}
const FRAME_MAX_ZOOM = 22

export class PolygonFeature {
  constructor (id = 'boundary') {
    this._feature = null
    this._id = id
    this._state = PolygonFeature.EMPTY
    this._type = null
    this._maxZoom = 20
    this._mapView = null
    // initialise the feature from the coordinates in the url, if there is one
    this.coordinates = getPolygonFromUrl()
  }

  // possible states
  static EMPTY = 'empty'
  static EDITING = 'editing'
  static COMPLETE = 'complete'
  // possible types
  static POLYGON = 'polygon'
  static SQUARE = 'square'

  get type () { return this._type }
  set type (newType) { this._type = newType }

  get frameMaxZoom () { return FRAME_MAX_ZOOM }
  get id () { return this._id }

  get state () { return this._state }
  set state (newState) { this._state = newState }

  get maxZoom () { return this._maxZoom }
  set maxZoom (newMaxZoom) { this._maxZoom = newMaxZoom }
  resetZoom () {
    if (this.mapView?.constraints) {
      this.mapView.constraints.maxZoom = this.maxZoom
    }
  }

  zoomOnSquare () {
    if (this.mapView?.constraints) {
      // Zoom in to avoid huge frames being requested by default
      this.mapView.constraints.maxZoom = this.frameMaxZoom
      this.mapView.goTo({ center: this.mapView.center, zoom: this.frameMaxZoom, duration: 200 })
    }
  }

  get mapView () { return this._mapView }
  set mapView (newMapView) {
    this._mapView = newMapView
    this.maxZoom = newMapView?.constraints?.maxZoom || this._maxZoom
  }

  get isSquare () { return this.type === PolygonFeature.SQUARE }
  get isPolygon () { return this.type === PolygonFeature.POLYGON }
  get isEmpty () { return this.state === PolygonFeature.EMPTY }
  get isEditing () { return this.state === PolygonFeature.EDITING }
  get isComplete () { return this.state === PolygonFeature.COMPLETE }

  get feature () { return this._feature }
  set feature (feature) {
    this._feature = feature ? { ...feature, id: this._id, properties: { ...feature.properties, id: this._id } } : null
    this.state = feature ? PolygonFeature.COMPLETE : PolygonFeature.EMPTY
    setQueryParam('encodedPolygon', this.encodedPolygon)
    setQueryParam('polygon', null)
  }

  get coordinates () {
    return this._feature?.geometry?.coordinates
  }

  get encodedPolygon () {
    return this.coordinates ? encodePolygon(this.coordinates[0]) : null
  }

  set coordinates (coordinates) {
    if (coordinates) {
      this.state = PolygonFeature.COMPLETE
      this.type = PolygonFeature.POLYGON
      this._feature = {
        id: this._id,
        type: 'feature',
        properties: { id: this._id },
        geometry: {
          type: 'Polygon',
          coordinates
        }
      }
    } else {
      this.feature = null
    }
  }
}

Object.freeze(PolygonFeature)

export const polygonFeature = new PolygonFeature()
