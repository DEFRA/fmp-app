const { mapState } = require('../interactive-map-helpers/mapState.js')

const keyHiddenIdMap = {}

const isHiddenByAnotherId = (id) => {
  return Object.entries(keyHiddenIdMap).some(([key, value]) => key !== id && value)
}

const keyAndSearchElements = ['map-search', 'map-map-key']
export const hideKeyAndSearchButton = () => {
  keyAndSearchElements.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.style.display = 'none'
    }
  })
}

export const showKeyAndSearchButton = () => {
  keyAndSearchElements.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.style.display = 'flex'
    }
  })
}

export const hideDatasetsKey = (id) => {
  if (!mapState.interactiveMap) {
    console.warn('No interactiveMap instance available to hide the datasets key.')
    return
  }
  // Store the hidden state for this id if the datasets key is already hidden by another id
  // or if the map key panel is currently open.
  // This ensures that whatever order, the reShows are called in,
  // the key panel will only be re-shown when all ids that have hidden it have been re-shown.
  keyHiddenIdMap[id] = isHiddenByAnotherId(id) || (Boolean(document.getElementById('map-panel-map-key')))
  if (!keyHiddenIdMap[id]) {
    return
  }
  mapState.interactiveMap.hidePanel('mapKey')
}

export const reShowDatasetsKey = (id) => {
  if (keyHiddenIdMap[id]) {
    if (!isHiddenByAnotherId(id)) {
      // Only re-show the datasets key if it was only hidden by this id and not by any other id
      mapState.interactiveMap.showPanel('mapKey')
    }
    // Save the state for this id as no longer hidden, so that if
    // it has been hidden by another process, it will not be re-shown until all
    // ids have hidden it have been re-shown.
    keyHiddenIdMap[id] = false
  }
}
