import createMapKeyPlugin from '@defra/interactive-map/plugins/map-key'
import { siteBoundary } from '../../interactive-map-helpers/siteBoundary.js'
import { terms } from '../../terms.js'
import { mapState } from '../../interactive-map-helpers/mapState.js'

const MAP_KEY_BUTTON_ID = 'map-map-key'

export const mapKeyPlugin = createMapKeyPlugin({
  groups: {
    'surface-water-depth-in-millimetres': {
      groupLabel: 'Surface water depth in millimetres',
      groupStyle: 'horizontal-ramp'
    }
  },
  manifest: {
    panels: [{
      id: 'mapKey',
      mobile: { slot: 'drawer', modal: false, exclusive: true, open: true },
      tablet: { slot: 'left-top', width: '360px', open: true },
      desktop: { slot: 'left-top', width: '360px', open: true },
    }],
    buttons: [{
      id: 'mapKey',
      mobile: { slot: 'top-left', showLabel: true, order: 2 },
    }]
  },
})

mapKeyPlugin.hideButton = () => {
  const element = document.getElementById(MAP_KEY_BUTTON_ID)
  if (element) {
    element.style.display = 'none'
  }
}

mapKeyPlugin.showButton = () => {
  const element = document.getElementById(MAP_KEY_BUTTON_ID)
  if (element) {
    element.style.display = 'flex'
  }
}

const keyHiddenIdMap = {}

mapKeyPlugin.panelIsHiddenByAnotherId = (id) => {
  return Object.entries(keyHiddenIdMap).some(([key, value]) => key !== id && value)
}

mapKeyPlugin.panelIsVisible = () => {
  const keyPanelElement = document.getElementById('map-panel-map-key')
  return Boolean(keyPanelElement?.checkVisibility?.())
}

mapKeyPlugin.hidePanel = (id) => {
  if (!mapState.interactiveMap) {
    console.warn('No interactiveMap instance available to hide the datasets key.')
    return
  }
  // Store the hidden state for this id if the datasets key is already hidden by another id
  // or if the map key panel is currently open.
  // This ensures that whatever order, the reShows are called in,
  // the key panel will only be re-shown when all ids that have hidden it have been re-shown.
  keyHiddenIdMap[id] = mapKeyPlugin.panelIsHiddenByAnotherId(id) || mapKeyPlugin.panelIsVisible()
  if (!keyHiddenIdMap[id]) {
    return
  }
  mapState.interactiveMap.hidePanel('mapKey')
}

mapKeyPlugin.reShowPanel = (id) => {
  if (keyHiddenIdMap[id]) {
    if (!mapKeyPlugin.panelIsHiddenByAnotherId(id)) {
      // Only re-show the datasets key if it was only hidden by this id and not by any other id
      mapState.interactiveMap.showPanel('mapKey')
    }
    // Save the state for this id as no longer hidden, so that if
    // it has been hidden by another process, it will not be re-shown until all
    // ids have hidden it have been re-shown.
    keyHiddenIdMap[id] = false
  }
}

mapKeyPlugin.attach = () => {
  mapKeyPlugin.interactiveMap.on('map-key:ready', function () {
    siteBoundary.onSetFeature(siteBoundary.feature)
  })
}

const siteBoundaryKeyDefinition = {
  id: 'site-boundary',
  label: terms.labels.locationBoundary,
  groupLabel: terms.labels.mapFeatures,
  style: {
    strokeWidth: 2,
    fill: 'none',
    stroke: { outdoor: '#D4351D', dark: '#ffffff' }
  },
}

siteBoundary.onSetFeature = (feature) => {
  if (feature) {
    mapKeyPlugin.addSymbol(siteBoundaryKeyDefinition)
  } else {
    mapKeyPlugin.removeSymbol(siteBoundaryKeyDefinition)
  }
}
