// /flood-map Path defined as an alias to npm or submodule version in webpack alias
import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'

import createMapStylesPlugin from '@defra/interactive-map/plugins/map-styles'
import createScaleBarPlugin from '@defra/interactive-map/plugins/scale-bar'
import createSearchPlugin from '@defra/interactive-map/plugins/search'
import { interactPlugin, attachInteractPlugin } from './interactive-map-helpers/interact'

import { setupEsriConfig, getRequest, getDefraMapConfig } from './tokens.js'
import { setUpBaseMaps } from './baseMap.js'
// import { encodePolygon } from '../../../server/services/shape-utils.js'
import { siteBoundary } from './interactive-map-helpers/siteBoundary.js'
// TODO: add the slider to the dataset plugin
// import { sliderMarkUp, initialiseSlider } from './slider/index.js'
import { getInfoPanel } from './infoPanel.js'

// <InteractiveMapHelpers>
import { initialiseDatasetsPlugin, getInfoPanelDataForEsriStyleLayerId } from './datasets/datasetsPlugin.js'

import { drawPlugin, framePlugin, attachDrawPlugin } from './draw/drawPlugin.js'

import { addHelpBanner, hideHelpPanel, showHelpPanel } from './helpBanner.js'

const ENGLAND_WEST = 50000
const ENGLAND_SOUTH = 10000
const ENGLAND_EAST = 400000
const ENGLAND_NORTH = 650000

const symbols = {
  noData: '/assets/images/no-data.svg',
  waterStorageAreas: '/assets/images/water-storage.svg',
  floodDefences: '/assets/images/flood-defence.svg',
  mainRivers: '/assets/images/main-rivers.svg'
}

getDefraMapConfig().then((defraMapConfig) => {
  const mapStyles = setUpBaseMaps(defraMapConfig.OS_ACCOUNT_NUMBER)
  const mapStyleOverrides = {
    id: 'mapStyles',
    desktop: { slot: 'right-top' },
    tablet: { slot: 'right-top' },
    mobile: { slot: 'right-top' }
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
      buttons: [mapStyleOverrides],
      panels: [mapStylePanelOverrides]
    }
  })
  const datasetsPlugin = initialiseDatasetsPlugin(defraMapConfig)

  const interactiveMap = new InteractiveMap('map', {
    mapProvider: esriProvider({
      setupConfig: setupEsriConfig
    }),
    plugins: [
      datasetsPlugin,
      mapStylePlugin,
      createScaleBarPlugin({ units: 'metric' }),
      createSearchPlugin({
        transformRequest: getRequest,
        placeholder: 'Search for a place in england',
        osNamesURL: 'https://api.os.uk/search/names/v1/find?query={query}&fq=local_type:postcode%20local_type:hamlet%20local_type:village%20local_type:town%20local_type:city%20local_type:suburban_area%20local_type:other_settlement&maxresults=8',
        regions: ['england'],
        width: '300px',
        showMarker: true
      }),
      drawPlugin,
      framePlugin,
      interactPlugin,
    ],
    behaviour: 'inline',
    place: 'England',
    minZoom: 6,
    maxZoom: 20,
    extent: siteBoundary.extents || [ENGLAND_WEST, ENGLAND_SOUTH, ENGLAND_EAST, ENGLAND_NORTH],
    containerHeight: '100%',
    enableZoomControls: true,
    symbols: [symbols.waterStorageAreas, symbols.floodDefences, symbols.mainRivers, symbols.noData],
    warningPosition: 'top',
    search: {
      label: 'Search for a place',
      isAutocomplete: true,
      isExpanded: false,
      country: 'england'
    },
    scaleBar: 'metric',
  })
  let reported = false
  interactiveMap.addEventListener = () => {
    if (!reported) {
      console.log('TODO - fix the listeners')
      reported = true
    }
  }
  let datasetsKeyExpanded = false
  const toggleKeyWhenEditing = (isEditing) => {
    const datasetsKey = document.getElementById('map-datasets-key')
    if (isEditing) {
      datasetsKeyExpanded = (datasetsKey?.getAttribute('aria-expanded') === 'true')
      if (datasetsKeyExpanded) {
        interactiveMap.hidePanel('datasetsKey')
      }
      datasetsKey.parentNode.style.display = 'none'
    } else {
      if (datasetsKeyExpanded) { // reinstate key
        interactiveMap.showPanel('datasetsKey')
      }
      datasetsKey.parentNode.style.display = ''
    }
  }

  const onEditPolygon = (isEditing) => {
    toggleKeyWhenEditing(isEditing)
    if (isEditing) {
      interactiveMap.removePanel('info')
      interactiveMap.removeMarker('search')
      interactiveMap.hidePanel('datasetsLayers')
      hideHelpPanel()
      if (datasetsPlugin.ready) { // hide layers
        datasetsPlugin.setDatasetVisibility(false)
      }
    } else {
      showHelpPanel() // Only Shows it if the user has not dismissed it before
      interactiveMap.showPanel('datasetsLayers')
      if (datasetsPlugin.ready) { // reinstate layers
        datasetsPlugin.setDatasetVisibility(true)
      }
    }
  }

  attachInteractPlugin(interactiveMap)
  attachDrawPlugin(interactiveMap, onEditPolygon)

  interactiveMap.on('app:ready', function (e) {
    interactiveMap.addButton('help', {
      label: 'Help',
      href: '/map-help',
      iconSvgContent: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
      mobile: { slot: 'right-top', showLabel: false },
      tablet: { slot: 'right-top', showLabel: false, order: 1 },
      desktop: { slot: 'right-top', showLabel: true, order: 1 }
    })
    // TODO: add the slider to the dataset plugin
    // initialiseSlider(interactiveMap)
  })

  interactiveMap.on('datasets:ready', function () {
    datasetsPlugin.ready = true
    updateVisibleLayers()
    initPointerMove()
  })

  interactiveMap.on('map:ready', function ({ map, view, _mapStyleId, _mapSize, _crs }) {
    mapState.map = map
    mapState.view = view
    addHelpBanner(interactiveMap)
  })

  interactiveMap.on('interact:markerchange', async (event) => {
    if (mapState.cursorStyleLayer) {
      const attributes = mapState.cursorAttributes
      const infoPanelValues = {
        ...getInfoPanelDataForEsriStyleLayerId(mapState.cursorStyleLayer),
        coords: `${Math.round(event.coords[0])},${Math.round(event.coords[1])}`,
        version: defraMapConfig.version
      }
      if (attributes?.flood_source) {
        infoPanelValues.fs = attributes.flood_source
      }
      const infoPanel = await getInfoPanel(infoPanelValues)
      const { width, label, html } = infoPanel
      interactiveMap.addPanel('info', {
        label,
        html,
        mobile: { slot: 'drawer', modal: true, open: true },
        tablet: { slot: 'left-top', width, open: true },
        desktop: { slot: 'left-top', width, open: true }

        // html: `<div>
        //     <p>Some info:</p>
        //     <p>${mapState.cursorStyleLayer}</p>
        //     <pre>${JSON.stringify(infoPanelValues, null, 2)}</pre>
        //     <pre>${JSON.stringify(attributes, null, 2)}</pre>
        //   </div>`,
        // visibleGeometry: { type: 'Feature', geometry: { type: 'Point', coordinates: event.coords } }
      })
    } else {
      interactiveMap.removeMarker('infoPanelMarker')
      interactiveMap.removePanel('info')
    }
  })

  const mapState = {
    map: null,
    isDark: false,
    isRamp: false,
    layers: [],
    segments: [],
    isClimateChange: false,
    isFloodZone: false
  }

  const updateVisibleLayers = () => {
    mapState.visibleLayers = mapState.map.allLayers.items.filter((item) =>
      item.type === 'vector-tile' &&
      item.visible === true &&
      item.id !== 'baselayer'
    )
  }

  const assignCursorStyleLayer = (hitTestResponse) => {
    let topHitTestData = null
    if (hitTestResponse?.results?.length > 0) {
      const visibleHitTestData = hitTestResponse?.results.reduce((hitTestData, result) => {
        const { layerId } = result.graphic?.origin || {}
        const { attributes } = result.graphic
        if (!layerId) {
          return hitTestData
        }
        const vtLayer = result.layer
        const styleLayer = vtLayer?.getStyleLayer(layerId)
        if (styleLayer?.layout?.visibility === 'visible') {
          hitTestData.push({ layerId, attributes })
        }
        return hitTestData
      }, [])

      topHitTestData = visibleHitTestData?.[0] || null
    }
    mapState.cursorStyleLayer = topHitTestData?.layerId || null
    mapState.cursorAttributes = topHitTestData?.attributes || null
    document.body.style.cursor = mapState.cursorStyleLayer ? 'pointer' : 'default'
  }

  const initPointerMove = () => {
    let lastHit = 0
    const throttleMs = 20 // Throttle to reduce hitTest usage
    const minScale = 250000 // vector tile layers use minScale value from arcgis online config for visibility

    mapState.view.on('pointer-enter', updateVisibleLayers)

    mapState.view.on('pointer-move', async event => {
      const now = Date.now()
      if (!mapState.visibleLayers || now - lastHit < throttleMs || mapState.view.scale > minScale) {
        return
      }
      lastHit = now
      await mapState.view.hitTest(event, { include: mapState.visibleLayers }).then(assignCursorStyleLayer)
      document.body.style.cursor = mapState.cursorStyleLayer ? 'pointer' : 'default'
    })

    mapState.view.on('pointer-leave', () => {
      document.body.style.cursor = 'default'
      mapState.visibleLayers = null
    })
  }

  // Listen to map queries
  interactiveMap.addEventListener('query', async e => {
    const infoPanel = await getInfoPanel(e, mapState, defraMapConfig.version)
    interactiveMap.setInfo(infoPanel)
  })
})
