// /flood-map Path defined as an alias to npm or submodule version in webpack alias
import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'

import createMapStylesPlugin from '@defra/interactive-map/plugins/map-styles'
import createScaleBarPlugin from '@defra/interactive-map/plugins/scale-bar'
import createSearchPlugin from '@defra/interactive-map/plugins/search'
import { interactPlugin, attachInteractPlugin } from './interactive-map-helpers/interact'

import { setupEsriConfig, getRequest, getDefraMapConfig } from './tokens.js'
import { setUpBaseMaps } from './baseMap.js'
import { checkParamsForPolygon, encodePolygon } from '../../../server/services/shape-utils.js'
// TODO: add the slider to the dataset plugin
// import { sliderMarkUp, initialiseSlider } from './slider/index.js'
import { getInfoPanel } from './infoPanel.js'

// <InteractiveMapHelpers>
import { datasetsPlugin } from './datasets/datasetsPlugin.js'

import { drawPlugin, framePlugin, attachDrawPlugin } from './draw/drawPlugin.js'

const mapDiv = document.getElementById('map')

const symbols = {
  noData: '/assets/images/no-data.svg',
  waterStorageAreas: '/assets/images/water-storage.svg',
  floodDefences: '/assets/images/flood-defence.svg',
  mainRivers: '/assets/images/main-rivers.svg'
}

// const MAX_POLYGON_AREA = 3000000

// capture polygon from query string
const queryParams = new URLSearchParams(window.location.search)

const calculateExtent = (polygonToCalculate) => {
  const calculatedExtent = polygonToCalculate.reduce((acc, [x, y]) => {
    acc[0] = Math.min(acc[0], x)
    acc[1] = Math.min(acc[1], y)
    acc[2] = Math.max(acc[2], x)
    acc[3] = Math.max(acc[3], y)
    return acc
  }, [Infinity, Infinity, -Infinity, -Infinity])
  return calculatedExtent
}

let extent
if (queryParams.get('encodedPolygon') || queryParams.get('polygon')) {
  const { polygon: polygonString } = checkParamsForPolygon({ encodedPolygon: queryParams.get('encodedPolygon'), polygon: queryParams.get('polygon'), encode: false })
  const polygon = JSON.parse(polygonString)
  extent = calculateExtent(polygon)
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

  const interactiveMap = new InteractiveMap('map', {
    mapProvider: esriProvider({
      setupConfig: setupEsriConfig
    }),
    plugins: [
      datasetsPlugin(defraMapConfig),
      mapStylePlugin,
      createScaleBarPlugin({ units: 'metric' }),
      createSearchPlugin({
        transformRequest: getRequest,
        placeholder: 'Search for a place in england',
        osNamesURL: 'https://api.os.uk/search/names/v1/find?query={query}&fq=local_type:postcode%20local_type:hamlet%20local_type:village%20local_type:town%20local_type:city%20local_type:suburban_area%20local_type:other_settlement&maxresults=8',
        regions: ['england'],
        width: '300px',
        showMarker: true,
        // expanded: true
      }),
      drawPlugin,
      framePlugin,
      interactPlugin,
    ],
    behaviour: 'inline',
    place: 'England',
    minZoom: 6,
    maxZoom: 20,
    extent: extent || [50000, 10000, 400000, 650000],
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
  attachInteractPlugin(interactiveMap)
  attachDrawPlugin(interactiveMap)

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
    updateVisibleLayers()
    initPointerMove()
  })

  interactiveMap.on('map:ready', function ({ map, view, _mapStyleId, _mapSize, _crs }) {
    mapState.map = map
    mapState.view = view

    interactiveMap.addPanel('help-banner', {
      label: 'Click on the flood zones for information',
      html: '<span class="im-u-visually-hidden">Alert:</span>',
      mobile: { slot: 'banner', dismissible: true },
      tablet: { slot: 'banner', dismissible: true, width: '372px' },
      desktop: { slot: 'banner', dismissible: true, width: '372px' }
    })
  })

  interactiveMap.on('interact:markerchange', function (e) {
    interactiveMap.addPanel('info', {
      label: 'Info',
      html: '<p>Some info</p>',
      visibleGeometry: { type: 'Feature', geometry: { type: 'Point', coordinates: e.coords } }
    })
  })
  let reported = false
  interactiveMap.addEventListener = () => {
    if (!reported) {
      console.log('TODO - fix the listeners')
      reported = true
    }
  }
  attachLayers(interactiveMap, defraMapConfig)
  addFeatureLayers(interactiveMap, defraMapConfig)
  attachKeyHandlers(interactiveMap)
  attachDrawPluginHandlers(interactiveMap)
  attachInteractPlugin(interactiveMap)

  interactiveMap.on('app:ready', function (e) {
    interactiveMap.addButton('help', {
      label: 'Help',
      href: '/map-help',
      iconSvgContent: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
      mobile: { slot: 'right-top', showLabel: false },
      tablet: { slot: 'right-top', showLabel: false, order: 1 },
      desktop: { slot: 'right-top', showLabel: true, order: 1 }
    })
    interactiveMap.addButton('menu', {
      label: 'Menu',
      panelId: 'menu',
      iconSvgContent: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
      mobile: { slot: 'top-left', order: 1, showLabel: false },
      tablet: { slot: 'top-left', order: 2 },
      desktop: { slot: 'top-left', order: 2 }
    })
    interactiveMap.addButton('key', {
      label: 'Key',
      panelId: 'key',
      iconSvgContent: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
      mobile: { slot: 'top-left', order: 2, showLabel: false },
      tablet: { slot: 'top-left', order: 3 },
      desktop: { slot: 'top-left', order: 3 }
    })
    interactiveMap.addPanel('menu', {
      label: 'Menu',
      html: renderMenuHTML(feature),
      mobile: { slot: 'side', modal: true, open: false, dismissible: true },
      tablet: { slot: 'side', width: '260px', open: true, dismissible: true },
      desktop: { slot: 'side', width: '280px', open: true, dismissible: false }
    })
    interactiveMap.addPanel('key', {
      label: 'Key',
      html: renderKeyHTML(),
      mobile: { slot: 'drawer', open: false, exclusive: true },
      tablet: { slot: 'left-top', width: '260px', open: false, exclusive: true },
      desktop: { slot: 'left-top', width: '280px', open: true, exclusive: false }
    })
    initialiseSlider(interactiveMap)
  })

  interactiveMap.on('map:ready', function ({ map, view, mapStyleId, mapSize, crs }) {
    initPointerMove(view)

    interactiveMap.addPanel('help-banner', {
      label: 'Click on the flood zones for information',
      html: '<span class="im-u-visually-hidden">Alert:</span>',
      mobile: { slot: 'banner', dismissible: true },
      tablet: { slot: 'banner', dismissible: true, width: '372px' },
      desktop: { slot: 'banner', dismissible: true, width: '372px' }
    })
  })

  interactiveMap.on('interact:markerchange', function (e) {
    interactiveMap.addPanel('info', {
      label: 'Info',
      html: '<p>Some info</p>',
      visibleGeometry: { type: 'Feature', geometry: { type: 'Point', coordinates: e.coords } }
    })
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
    // console.log('visibleLayers', mapState.visibleLayers)
  }

  const assignCursorStyleLayer = (hitTestResponse) => {
    let topVisibleStyleLayerId = null
    if (hitTestResponse?.results?.length > 0) {
      const visibleStyleLayerIds = hitTestResponse?.results.reduce((layerIds, result) => {
        const { layerId } = result.graphic?.origin || {}
        if (!layerId) {
          return layerIds
        }
        const vtLayer = result.layer
        const styleLayer = vtLayer?.getStyleLayer(layerId)
        if (styleLayer?.layout?.visibility === 'visible') {
          layerIds.push(layerId)
        }
        return layerIds
      }, [])

      topVisibleStyleLayerId = visibleStyleLayerIds?.[0] || null
    }
    if (mapState.cursorStyleLayer !== topVisibleStyleLayerId) {
      mapState.cursorStyleLayer = topVisibleStyleLayerId
      console.log('cursorStyleLayer', mapState.cursorStyleLayer)
    }
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

  mapDiv.addEventListener('appaction', e => {
    const { type } = e.detail
    if (type === 'confirmPolygon' || type === 'updatePolygon') {
      const url = new URL(window.location)
      const polygon = e.detail?.query?.geometry?.coordinates?.[0]
      mapState.polygon = roundPolygon(polygon)
      url.searchParams.set('encodedPolygon', encodePolygon(polygon))
      url.search = decodeURIComponent(url.search)
      window.history.replaceState(null, '', url)
    }
    if (type === 'deletePolygon') {
      delete mapState.polygon
      const url = new URL(window.location)
      url.searchParams.delete('encodedPolygon')
      url.search = decodeURIComponent(url.search)
      window.history.replaceState(null, '', url)
    }
  })

  const roundPolygon = (polygon) => {
    return polygon.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100])
  }

  // event to fire for 'Get site report' button to non dynamic results page
  document.addEventListener('click', e => {
    if (e.target.innerText === 'Get summary report') {
      const polygon = mapState.polygon
      const encodedPolygon = encodePolygon(polygon)
      window.location = `/results?encodedPolygon=${encodedPolygon}`
    }
  })

  // Listen to map queries
  interactiveMap.addEventListener('query', async e => {
    const infoPanel = await getInfoPanel(e, mapState, defraMapConfig.version)
    interactiveMap.setInfo(infoPanel)
  })
})
