import { getQueryParam } from './queryParams.js'

class MapState {
  _isDark = false

  get isDark () {
    return this._isDark
  }

  set isDark (isDark) {
    this._isDark = isDark
  }

  get segments () { // TODO - remove this
    return this.dataset
  }

  get dataset () {
    return getQueryParam('dataset') || 'floodzones-presentday'
  }

  get features () {
    return getQueryParam('features') || ''
  }
}

const mapState = new MapState()

export { mapState }
