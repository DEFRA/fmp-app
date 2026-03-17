import { getQueryParam } from './queryParams.js'

class MapState {
  get isDark () {
    return false
  }

  get segments () {
    return getQueryParam('dataset') || 'none'
  }

  get features () {
    return getQueryParam('features') || ''
  }
}

const mapState = new MapState()

export { mapState }
