import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'

import createMapStylesPlugin from '@defra/interactive-map/plugins/map-styles'
import createScaleBarPlugin from '@defra/interactive-map/plugins/scale-bar'
import { searchPlugin, attachSearchPlugin } from './plugins/search/search.js'
import createMapKeyPlugin from '@defra/interactive-map/plugins/map-key'
import createMenuPlugin from '@defra/interactive-map/plugins/menu'
import { initialiseMenu } from './datasets/datasetsMenu.js'
import { interactPlugin, attachInteractPlugin } from './interactive-map-helpers/interact'

import { setupEsriConfig, getDefraMapConfig } from './tokens.js'
import { setUpBaseMaps } from './baseMap.js'
import { siteBoundary } from './interactive-map-helpers/siteBoundary.js'
import { hideDatasetsKey, reShowDatasetsKey, hideKeyAndSearchButton, showKeyAndSearchButton } from './datasets/showHideDatasetsKey.js'
import createOpacitySliderPlugin from './plugins/opacity-slider/src/index.js'

// <InteractiveMapHelpers>
import { initialiseDatasetsPlugin } from './datasets/datasetsPlugin.js'

import { drawPlugin, framePlugin, attachDrawPlugin } from './draw/drawPlugin.js'

import { mapState } from './interactive-map-helpers/mapState.js'
import { getQueryParam, setQueryParam } from './interactive-map-helpers/queryParams.js'

const ENGLAND_WEST = 50000
const ENGLAND_SOUTH = 40000
const ENGLAND_EAST = 400000
const ENGLAND_NORTH = 650000

// Parse the location query parameter from the URL and store it in the mapState for later use
// This the value passed from the /location page - used to display a marker on the map when it is first loaded.
// The query parameter is then removed from the URL to avoid it being used again on subsequent page loads.
const location = getQueryParam('location')
if (location) {
  mapState.location = location
  setQueryParam('location', null)
}

getDefraMapConfig().then((defraMapConfig) => {
  mapState.defraMapConfig = defraMapConfig
  const mapStyles = setUpBaseMaps(defraMapConfig.OS_ACCOUNT_NUMBER)
  const mapStyleButtonOverrides = {
    id: 'mapStyles',
    desktop: { slot: 'right-top', order: 2, showLabel: false },
    tablet: { slot: 'right-top', order: 2, showLabel: false },
    mobile: { slot: 'right-top', order: 2, showLabel: false }
  }
  const mapStylePanelOverrides = {
    id: 'mapStyles',
    desktop: { slot: 'map-styles-button', width: '400px', modal: true },
    tablet: { slot: 'map-styles-button', modal: true },
    mobile: { slot: 'map-styles-button', modal: true }
  }

  const mapStylePlugin = createMapStylesPlugin({
    mapStyles,
    manifest: {
      buttons: [mapStyleButtonOverrides],
      panels: [mapStylePanelOverrides]
    }
  })
  const datasetsPlugin = initialiseDatasetsPlugin(defraMapConfig)

  const opacitySliderPlugin = createOpacitySliderPlugin({
    heading: 'Layer opacity',
    onChange: (opacity) => datasetsPlugin.setOpacity(opacity)
  })

  const interactiveMap = new InteractiveMap('map', {
    mapProvider: esriProvider({
      setupConfig: setupEsriConfig
    }),
    plugins: [
      datasetsPlugin,
      opacitySliderPlugin,
      createMapKeyPlugin({
        groups: {
          'surface-water-depth-in-millimetres': {
            groupLabel: 'Surface water depth in millimetres',
            groupStyle: 'horizontal-ramp'
          }
        },
        manifest: {
          panels: [{
            id: 'mapKey',
            tablet: { slot: 'left-top', width: '360px', open: true },
            desktop: { slot: 'left-top', width: '360px', open: true },
          }]
        },
      }),
      createMenuPlugin({
        manifest: {
          panels: [{
            id: 'menu',
            desktop: { open: true, slot: 'side', width: '280px', dismissible: false, exclusive: false, },
            tablet: { slot: 'side', width: '280px', modal: true }
          }],
          buttons: [
            {
              id: 'menuButton',
              excludeWhen: ({ appState }) => (appState?.breakpoint === 'desktop'),
            }
          ]
        },
        menu: initialiseMenu(datasetsPlugin)
      }),
      mapStylePlugin,
      createScaleBarPlugin({ units: 'metric' }),
      searchPlugin,
      drawPlugin,
      framePlugin,
      interactPlugin,
    ],
    behaviour: 'inline',
    place: 'England',
    minZoom: 6,
    maxZoom: 20,
    extent: siteBoundary.buffedExtents || [ENGLAND_WEST, ENGLAND_SOUTH, ENGLAND_EAST, ENGLAND_NORTH],
    containerHeight: '100%',
    enableMapControls: false,
    enableZoomControls: true,
  })
  let reported = false
  interactiveMap.addEventListener = () => {
    if (!reported) {
      console.log('TODO - fix the listeners')
      reported = true
    }
  }

  const toggleKeyWhenEditing = (isEditing) => {
    if (isEditing) {
      hideKeyAndSearchButton()
      hideDatasetsKey('editing')
    } else {
      showKeyAndSearchButton()
      reShowDatasetsKey('editing')
    }
  }

  const onEditPolygon = (isEditing) => {
    toggleKeyWhenEditing(isEditing)
    if (isEditing) {
      interactPlugin.hideInfoPanel()
      interactiveMap.removeMarker('search')
      interactiveMap.hidePanel('menu')
      // Disable the selectAtTarget (infoPanel) button
      interactiveMap.toggleButtonState('selectAtTarget', 'disabled', true)
      if (datasetsPlugin.ready) { // hide layers
        datasetsPlugin.setDatasetVisibility(false)
      }
    } else {
      interactiveMap.showPanel('menu')
      if (datasetsPlugin.ready) {
        datasetsPlugin.setDatasetVisibility(true)
      }
      interactPlugin.triggerHitTest()
    }
  }
  attachInteractPlugin(interactiveMap)
  attachDrawPlugin(interactiveMap, onEditPolygon)

  attachSearchPlugin(interactiveMap, {
    onOpened: () => {
      // Hide the info panel when the search is opened. In reality, it
      // is already hidden before this event is fired, but we call it
      // here to ensure that the infoPanel marker is also removed.
      interactPlugin.hideInfoPanel()
    },
    onClosed: () => {
      // Ironically, we must hide the info panel when the search is
      // closed too, This is because the IM hides just about everything
      // when search is opened, but shows them once it is closed and we
      // don't want it to. So we force it closed here.
      interactPlugin.hideInfoPanel()
    }
  })

  interactiveMap.on('app:ready', function (e) {
    interactiveMap.addButton('help', {
      label: 'Help',
      href: '/map-help',
      iconSvgContent: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
      mobile: { slot: 'right-top', showLabel: false },
      tablet: { slot: 'right-top', showLabel: false, order: 1 },
      desktop: { slot: 'right-top', showLabel: false, order: 1 }
    })
  })

  interactiveMap.on('search:match', (event) => {
    interactiveMap.addMarker('search', event.point, {
      label: event.text,
      showLabel: true
    })
  })

  interactiveMap.on('datasets:ready', function () {
    datasetsPlugin.ready = true
    mapState.updateVisibleLayers()
    initPointerMove()
    reactiveUtils.when(
      () => (!mapState.view.updating),
      () => {
        // Update the enabled state of the infoPanel button when the map is moved on a touch device
        if (mapState.interfaceType === 'touch') {
          interactPlugin.triggerHitTest()
        }
      })
  })

  interactiveMap.on('map:ready', function ({ map, view, _mapStyleId, _mapSize, _crs }) {
    mapState.interactiveMap = interactiveMap
    mapState.map = map
    mapState.view = view
    if (mapState.location) {
      // Show a labelled marker on the map for the location passed from the /location page, if any
      const { x, y } = view.center
      interactiveMap.addMarker('search', [x, y], {
        label: mapState.location,
        showLabel: true
      })
    }
  })

  const initPointerMove = () => {
    let lastHit = 0
    const throttleMs = 20 // Throttle to reduce hitTest usage
    const minScale = 250000 // vector tile layers use minScale value from arcgis online config for visibility

    mapState.view.on('pointer-enter', () => mapState.updateVisibleLayers())

    mapState.view.on('pointer-move', async event => {
      const now = Date.now()
      if (mapState.interfaceType !== 'mouse' || !mapState.visibleLayers || now - lastHit < throttleMs || mapState.view.scale > minScale) {
        return
      }
      lastHit = now
      await mapState.view.hitTest(event, { include: mapState.visibleLayers }).then(mapState.assignCursorStyleLayer)
      document.body.style.cursor = mapState.cursorStyleLayer ? 'pointer' : 'default'
    })

    mapState.view.on('pointer-leave', () => {
      if (mapState.interfaceType === 'touch') {
        return
      }
      document.body.style.cursor = 'default'
      mapState.visibleLayers = null
    })
  }
})
