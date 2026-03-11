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

class PolygonFeature {
  constructor (id = 'boundary') {
    this._feature = null
    this._id = id
    // initialise the feature from the coordinates in the url, if there is one
    this.coordinates = getPolygonFromUrl()
  }

  get feature () {
    return this._feature
  }

  set feature (feature) {
    this._feature = feature ? { ...feature, id: this._id } : null
    const encodedPolygon = this._feature ? encodePolygon(this.coordinates[0]) : null
    setQueryParam('encodedPolygon', encodedPolygon)
    setQueryParam('polygon', null)
  }

  get coordinates () {
    return this._feature?.geometry?.coordinates
  }

  set coordinates (coordinates) {
    if (coordinates) {
      this._feature = {
        id: this._id,
        type: 'feature',
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

export const polygonFeature = new PolygonFeature()
