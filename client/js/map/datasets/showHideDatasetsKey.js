const { mapState } = require('../interactive-map-helpers/mapState.js')

let _keyWasVisible = false

export const hideDatasetsKey = () => {
  _keyWasVisible = mapState.interactiveMap && Boolean(document.getElementById('map-panel-map-key'))
  if (!_keyWasVisible) {
    return
  }
  mapState.interactiveMap.hidePanel('mapKey')
}

export const reShowDatasetsKey = () => {
  if (_keyWasVisible) {
    mapState.interactiveMap.showPanel('mapKey')
    _keyWasVisible = false
  }
}
