const { mapState } = require('../interactive-map-helpers/mapState.js')

let _keyWasVisible = false

export const hideDatasetsKey = () => {
  _keyWasVisible = mapState.interactiveMap && Boolean(document.getElementById('map-panel-datasets-key'))
  if (!_keyWasVisible) {
    return
  }
  mapState.interactiveMap.hidePanel('datasetsKey')
}

export const reShowDatasetsKey = () => {
  if (_keyWasVisible) {
    mapState.interactiveMap.showPanel('datasetsKey')
    _keyWasVisible = false
  }
}
