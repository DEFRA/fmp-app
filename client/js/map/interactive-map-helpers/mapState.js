import { getQueryParam } from './queryParams.js'

class MapState {
  get isDark () {
    return false
  }

  get segments () {
    return getQueryParam('dataset')
  }
}

const mapState = new MapState()

export { mapState }
