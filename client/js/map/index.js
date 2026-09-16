import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'
import { setupEsriConfig, getDefraMapConfig } from './tokens.js'
import { siteBoundary } from './interactive-map-helpers/siteBoundary.js'
import { mapState } from './interactive-map-helpers/mapState.js'
import { plugins, initialisePlugins, attachInteractiveMapToPlugins } from './plugins/initialisePlugins.js'

const ENGLAND_WEST = 50000
const ENGLAND_SOUTH = 40000
const ENGLAND_EAST = 400000
const ENGLAND_NORTH = 650000

getDefraMapConfig().then((defraMapConfig) => {
  mapState.defraMapConfig = defraMapConfig

  const interactiveMap = new InteractiveMap('map', {
    mapProvider: esriProvider({
      setupConfig: setupEsriConfig
    }),
    plugins: initialisePlugins(defraMapConfig),
    behaviour: 'inline',
    place: 'England',
    minZoom: 6,
    maxZoom: 20,
    extent: siteBoundary.buffedExtents || [ENGLAND_WEST, ENGLAND_SOUTH, ENGLAND_EAST, ENGLAND_NORTH],
    containerHeight: '100%',
    enableMapControls: false,
    enableZoomControls: true,
  })
  mapState.attach(interactiveMap)

  attachInteractiveMapToPlugins(interactiveMap)

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
    plugins.datasets.ready = true
    mapState.updateVisibleLayers()
    initPointerMove()
    reactiveUtils.when(
      () => (!mapState.view.updating),
      () => {
        // Update the enabled state of the infoPanel button when the map is moved on a touch device
        if (mapState.interfaceType === 'touch') {
          plugins.interact.triggerHitTest()
        }
      })
  })

  interactiveMap.on('map-key:ready', function () {
    siteBoundary.onSetFeature(siteBoundary.feature)
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
