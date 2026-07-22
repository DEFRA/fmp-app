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
import { drawPlugin, framePlugin, attachDrawPluginHandlers } from './interactive-map-helpers/draw.js'
// </InteractiveMapHelpers>

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
    // TODO: add the slider to the dataset plugin
    // initialiseSlider(interactiveMap)
  })

  interactiveMap.on('datasets:ready', function () {
    updateVisibleLayers()
    initPointerMove(mapState.view)
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
    mapState.visibleLayers = mapState.map.allLayers.items.filter((item) => (item.type === 'group' || item.type === 'vector-tile') && item.visible === true && item.id !== 'baselayer')
    console.log('visibleLayers', mapState.visibleLayers)
  }

  const initPointerMove = (view) => {
    let lastHit = 0
    const throttleMs = 20 // Throttle to reduce hitTest usage
    const minScale = 250000 // vector tile layers use minScale value from arcgis online config for visibility

    view.on('pointer-enter', updateVisibleLayers)

    view.on('pointer-move', event => {
      const now = Date.now()
      if (!mapState.visibleLayers || now - lastHit < throttleMs || view.scale > minScale) {
        return
      }
      lastHit = now
      view.hitTest(event, { include: mapState.visibleLayers }).then((response) => {
        let topVisibleStyleLayerId = null
        if (response?.results?.length > 0) {
          const visibleStyleLayerIds = response?.results.reduce((layerIds, result) => {
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
        document.body.style.cursor = topVisibleStyleLayerId ? 'pointer' : 'default'
      })
    })

    view.on('pointer-leave', () => {
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
