// /flood-map Path defined as an alias to npm or submodule version in webpack alias
import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'

import createMapStylesPlugin from '@defra/interactive-map/plugins/map-styles'
import createScaleBarPlugin from '@defra/interactive-map/plugins/scale-bar'
import createSearchPlugin from '@defra/interactive-map/plugins/search'
import { interactPlugin, attachInteractPlugin } from './interactive-map-helpers/interact'

import { setupEsriConfig, getRequest, getDefraMapConfig, setEsriConfig } from './tokens.js'
import { terms } from './terms.js'
import { colours, getKeyItemFill } from './colours.js'
import { attachLayers, vtLayers, FloodMapLayer } from './mapLayers/index.js'
import { addFeatureLayers } from './mapLayers/featureLayers/featureLayers.js'
import { setUpBaseMaps } from './baseMap.js'
import { checkParamsForPolygon, encodePolygon } from '../../../server/services/shape-utils.js'
import { sliderMarkUp, initialiseSlider } from './slider/index.js'
import { renderBanner } from './banner.js'
import { getInfoPanel } from './infoPanel.js'

// <InteractiveMapHelpers>
import { renderMenuHTML } from './interactive-map-helpers/menu.js'
import { renderKeyHTML, attachKeyHandlers } from './interactive-map-helpers/key.js'
import { drawPlugin, framePlugin, attachDrawPluginHandlers } from './interactive-map-helpers/draw.js'

// </InteractiveMapHelpers>

const feature = null// TODO - make this non global

const mapDiv = document.getElementById('map')

const symbols = {
  noData: '/assets/images/no-data.svg',
  waterStorageAreas: '/assets/images/water-storage.svg',
  floodDefences: '/assets/images/flood-defence.svg',
  mainRivers: '/assets/images/main-rivers.svg'
}

const MAX_POLYGON_AREA = 3000000

const keyItemDefinitions = {
  floodZone2: {
    label: 'Flood zone 2',
    fill: getKeyItemFill(colours.floodZone2)
  },
  floodZone3: {
    label: 'Flood zone 3',
    fill: getKeyItemFill(colours.floodZone3)
  },
  floodZone2PresentDay: {
    label: 'Flood zone 2 (present day)',
    fill: getKeyItemFill(colours.floodZone2)
  },
  floodZone3PresentDay: {
    label: 'Flood zone 3 (present day)',
    fill: getKeyItemFill(colours.floodZone3)
  },
  floodZone3CC: {
    label: terms.labels.floodZoneClimateChange,
    fill: getKeyItemFill(colours.floodZoneClimateChange)
  },
  floodZoneClimateChangeNoData: {
    label: terms.labels.noData,
    icon: symbols.noData,
    fill: getKeyItemFill(colours.floodZoneClimateChangeNoData)
  },
  waterStorageAreas: {
    id: 'fsa',
    label: 'Water storage',
    icon: symbols.waterStorageAreas,
    fill: getKeyItemFill(colours.waterStorageAreas)
  },
  floodDefences: {
    id: 'fd',
    label: 'Flood defence',
    icon: symbols.floodDefences,
    fill: getKeyItemFill(colours.floodDefences)
  },
  mainRivers: {
    id: 'mainr',
    label: 'Main Rivers',
    icon: symbols.mainRivers,
    fill: getKeyItemFill(colours.mainRivers)
  },
  floodExtents: {
    // id: 'fz2',
    label: 'Flood extent',
    fill: getKeyItemFill(colours.floodExtents)
  },
  surfaceWater0: {
    label: '2300',
    fill: getKeyItemFill(colours.nonFloodZoneDepthBands[0])
  },
  surfaceWater1: {
    label: '1200',
    fill: getKeyItemFill(colours.nonFloodZoneDepthBands[1])
  },
  surfaceWater2: {
    label: '900',
    fill: getKeyItemFill(colours.nonFloodZoneDepthBands[2])
  },
  surfaceWater3: {
    label: '600',
    fill: getKeyItemFill(colours.nonFloodZoneDepthBands[3])
  },
  surfaceWater4: {
    label: '300',
    fill: getKeyItemFill(colours.nonFloodZoneDepthBands[4])
  },
  surfaceWater5: {
    label: '150',
    fill: getKeyItemFill(colours.nonFloodZoneDepthBands[5])
  },
  surfaceWater6: {
    label: '',
    fill: getKeyItemFill(colours.nonFloodZoneDepthBands[6])
  },
  surfaceWaterDepth150: { label: terms.depth.depth150, fill: getKeyItemFill(colours.nonFloodZone) },
  surfaceWaterDepth300: { label: terms.depth.depth300, fill: getKeyItemFill(colours.nonFloodZone) },
  surfaceWaterDepth600: { label: terms.depth.depth600, fill: getKeyItemFill(colours.nonFloodZone) },
  surfaceWaterDepth900: { label: terms.depth.depth900, fill: getKeyItemFill(colours.nonFloodZone) },
  surfaceWaterDepth1200: { label: terms.depth.depth1200, fill: getKeyItemFill(colours.nonFloodZone) },
  surfaceWaterDepth2300: { label: terms.depth.depth2300, fill: getKeyItemFill(colours.nonFloodZone) },
  surfaceWaterDepthOver2300: { label: terms.depth.depthOver2300, fill: getKeyItemFill(colours.nonFloodZone) }
}

keyItemDefinitions.common = {
  heading: terms.labels.mapFeatures,
  collapse: 'collapse',
  items: [
    keyItemDefinitions.waterStorageAreas,
    keyItemDefinitions.floodDefences,
    keyItemDefinitions.mainRivers
  ]
}

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

let featureQuery, extent
if (queryParams.get('encodedPolygon') || queryParams.get('polygon')) {
  const { polygon: polygonString } = checkParamsForPolygon({ encodedPolygon: queryParams.get('encodedPolygon'), polygon: queryParams.get('polygon'), encode: false })
  const polygon = JSON.parse(polygonString)

  featureQuery = {
    type: 'feature',
    geometry: {
      type: 'polygon',
      coordinates: polygon
    }
  }
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
    // interceptorsCallback: getInterceptors,
    warningPosition: 'top',
    search: {
      label: 'Search for a place',
      isAutocomplete: true,
      isExpanded: false,
      country: 'england'
    },
    legend: {
      htmlAfter: sliderMarkUp,
      width: '280px',
      isVisible: true,
      keyWidth: '360px',
      keyDisplay: 'min',
      segments: [{
        heading: 'Datasets',
        collapse: 'collapse',
        items: [
          {
            id: 'fz',
            label: 'Flood zones 2 and 3'
          },
          // Left in place for reinstating later
          // {
          //   id: 'rsd',
          //   label: 'River and sea with defences'
          // },
          // {
          //   id: 'rsu',
          //   label: 'River and sea without defences'
          // },
          {
            id: 'sw',
            label: 'Surface water'
          },
          {
            id: 'mo',
            label: 'None'
          }
        ]
      },
      {
        id: 'tf',
        heading: terms.labels.climateChange,
        collapse: 'collapse',
        parentIds: ['fz'],
        items: [
          {
            id: 'fzpd',
            label: terms.labels.presentDay
          },
          {
            id: 'fzcl',
            label: terms.labels.fzClimateChange
          }
        ]
      },
      {
        id: 'tf',
        heading: terms.labels.climateChange,
        collapse: 'collapse',
        parentIds: ['rsd', 'rsu'],
        items: [
          {
            id: 'pd',
            label: terms.labels.presentDay
          },
          {
            id: 'cl',
            label: 'Years 2070 to 2125'
          }
        ]
      },
      {
        id: 'tf',
        heading: terms.labels.climateChange,
        collapse: 'collapse',
        parentIds: ['sw'],
        items: [
          {
            id: 'pd',
            label: terms.labels.presentDay
          },
          {
            id: 'cl',
            label: '2061 to 2125'
          }
        ]
      },
      {
        id: 'af1',
        heading: terms.labels.annualLikelihood,
        collapse: 'collapse',
        parentIds: ['rsd'],
        items: [
          {
            id: 'hr',
            label: terms.chance.rsHigh
          },
          {
            id: 'mr',
            label: terms.chance.rsMedium
          },
          {
            id: 'lr',
            label: terms.chance.rsLow
          }
        ]
      },
      {
        id: 'sw1',
        heading: terms.labels.annualLikelihood,
        collapse: 'collapse',
        parentIds: ['sw'],
        items: [
          {
            id: 'hr',
            label: terms.chance.swHigh
          },
          {
            id: 'mr',
            label: terms.chance.swMedium,
            isSelected: true
          },
          {
            id: 'lr',
            label: terms.chance.swLow
          }
        ]
      },
      {
        id: 'sw2',
        heading: terms.labels.depth,
        collapse: 'collapse',
        parentIds: ['sw'],
        items: [
          {
            id: 'depthAll',
            label: terms.depth.depthAll
          },
          {
            id: 'depth150',
            label: terms.depth.depth150
          },
          {
            id: 'depth300',
            label: terms.depth.depth300
          },
          {
            id: 'depth600',
            label: terms.depth.depth600
          },
          {
            id: 'depth900',
            label: terms.depth.depth900
          },
          {
            id: 'depth1200',
            label: terms.depth.depth1200
          },
          {
            id: 'depth2300',
            label: terms.depth.depth2300
          },
          {
            id: 'depthOver2300',
            label: terms.depth.depthOver2300
          }
        ]
      },
      {
        id: 'af2',
        heading: terms.labels.annualLikelihood,
        parentIds: ['rsu'],
        items: [
          {
            id: 'mr',
            label: terms.chance.rsMedium
          },
          {
            id: 'lr',
            label: terms.chance.rsLow
          }
        ]
      }
      ],
      key: [
        {
          heading: terms.labels.mapFeatures,
          collapse: 'collapse',
          parentIds: ['fzpd'],
          items: [
            keyItemDefinitions.floodZone2,
            keyItemDefinitions.floodZone3,
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        },
        {
          heading: terms.labels.mapFeatures,
          collapse: 'collapse',
          parentIds: ['fzcl'],
          items: [
            keyItemDefinitions.floodZone2PresentDay,
            keyItemDefinitions.floodZone3PresentDay,
            keyItemDefinitions.floodZone3CC,
            keyItemDefinitions.floodZoneClimateChangeNoData,
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        },
        { // Surface Water DepthAll
          heading: terms.labels.mapFeatures,
          collapse: 'collapse',
          parentIds: ['rsd', 'rsu', 'depthAll'],
          items: [
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers,
            {
              label: 'Surface water depth in millimetres',
              display: 'ramp',
              numLabels: 1,
              items: [
                keyItemDefinitions.surfaceWater6,
                keyItemDefinitions.surfaceWater5,
                keyItemDefinitions.surfaceWater4,
                keyItemDefinitions.surfaceWater3,
                keyItemDefinitions.surfaceWater2,
                keyItemDefinitions.surfaceWater1,
                keyItemDefinitions.surfaceWater0
              ]
            }
          ]
        },
        // Surface Water Extents:
        {
          parentIds: ['depth150'],
          ...keyItemDefinitions.common,
          items: [...keyItemDefinitions.common.items, keyItemDefinitions.surfaceWaterDepth150]
        },
        {
          parentIds: ['depth300'],
          ...keyItemDefinitions.common,
          items: [...keyItemDefinitions.common.items, keyItemDefinitions.surfaceWaterDepth300]
        },
        {
          parentIds: ['depth600'],
          ...keyItemDefinitions.common,
          items: [...keyItemDefinitions.common.items, keyItemDefinitions.surfaceWaterDepth600]
        },
        {
          parentIds: ['depth900'],
          ...keyItemDefinitions.common,
          items: [...keyItemDefinitions.common.items, keyItemDefinitions.surfaceWaterDepth900]
        },
        {
          parentIds: ['depth1200'],
          ...keyItemDefinitions.common,
          items: [...keyItemDefinitions.common.items, keyItemDefinitions.surfaceWaterDepth1200]
        },
        {
          parentIds: ['depth2300'],
          ...keyItemDefinitions.common,
          items: [...keyItemDefinitions.common.items, keyItemDefinitions.surfaceWaterDepth2300]
        },
        {
          parentIds: ['depthOver2300'],
          ...keyItemDefinitions.common,
          items: [...keyItemDefinitions.common.items, keyItemDefinitions.surfaceWaterDepthOver2300]
        },
        {
          heading: terms.labels.mapFeatures,
          collapse: 'collapse',
          parentIds: ['mo'],
          items: [
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        }
      ]
    },
    scaleBar: 'metric',
    queryArea: {
      collapse: 'collapse',
      heading: 'Get data for your location',
      submitLabel: 'Get summary report',
      keyLabel: 'Location boundary',
      summary: 'Add or edit a location boundary',
      maxZoom: 22,
      drawTools: ['polygon', 'square'],
      areaUnits: 'hectares',
      feature: featureQuery, // feature derived from polygon query string or null if not present
      onShapeUpdate: ({ area, geometry }) => {
        // We seem to be getting this when we are not editing a shape = one to ask Dan about.
        if (!area || !geometry) {
          return {}
        }
        const isValid = area <= MAX_POLYGON_AREA
        const warningText = isValid ? null : 'Boundary must be under 300 hectares to order data. You can still download a flood map.'
        // This longer version was Rachel's initial suggestion, but was reduced to fit on screen,
        // with css we can make it fit, but awaiting opinions from the design team.
        // const warningText = isValid ? null : 'Reduce your boundary size to under <span>300<span> hectares to order detailed flood risk information (product 4). You can still download a flood map (product 1).'
        mapState.shapeIsValid = isValid
        return { warningText, allowShape: true }
      }
    },
    queryLocation: {
      layers: vtLayers.map(vtLayer => vtLayer.name)
    }
  }, (esriMapObjects) => {
    const { esriConfig } = esriMapObjects
    mapState.esriConfig = esriConfig
    mapState.polygon = featureQuery?.geometry?.coordinates
    setEsriConfig(esriConfig)
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

  interactiveMap.on('interact:markerchange', function (e) {
    interactiveMap.addPanel('info', {
      label: 'Info',
      html: '<p>Some info</p>',
      visibleGeometry: { type: 'Feature', geometry: { type: 'Point', coordinates: e.coords } }
    })
  })

  const mapState = {
    isDark: false,
    isRamp: false,
    layers: [],
    segments: [],
    isClimateChange: false,
    isFloodZone: false
  }

  const updateMapState = (segments, layers, style) => {
    mapState.segments = segments
    mapState.layers = layers
    mapState.isDark = style ? style === 'dark' || style?.name === 'dark' : mapState.isDark
    mapState.isRamp = layers.includes('md')
    mapState.isClimateChange = segments.includes('cl') || segments.includes('fzcl')
    mapState.isFloodZone = segments.includes('fz') || segments.includes('fzcl') || segments.includes('fzpd')
    mapState.isSurfaceWater = segments.includes('sw')
    if (segments.includes('lr')) {
      mapState.riskLevel = 'low'
    } else if (segments.includes('mr')) {
      mapState.riskLevel = 'medium'
    } else if (segments.includes('hr')) {
      mapState.riskLevel = 'high'
    } else {
      mapState.riskLevel = ''
    }
    mapState.ds = mapState.isFloodZone ? 'fz' : 'sw'
  }

  // Component is ready and we have access to map
  // We can listen for map events now, such as 'loaded'
  interactiveMap.addEventListener('ready', async e => {
    const { segments, layers, style } = e.detail
    updateMapState(segments, layers, style)
    await FloodMapLayer.initialise({
      mapState,
      config: defraMapConfig
    })
    initPointerMove()
    initialiseSlider()
    renderBanner(mapState)
  })

  // Listen for mode, segments, layers or style changes
  interactiveMap.addEventListener('change', e => {
    const { type, mode, segments, layers, style } = e.detail
    updateMapState(segments, layers, style)
    if (['layer', 'segment'].includes(type)) {
      interactiveMap.setInfo(null)
    }
    renderBanner({ ...mapState, type, mode })
  })

  const initPointerMove = () => {
    let lastHit = 0
    const throttleMs = 20 // Throttle to reduce hitTest usage
    const minScale = 250000 // vector tile layers use minScale value from arcgis online config for visibility
    interactiveMap.view.on('pointer-move', e => {
      const now = Date.now()
      if (!FloodMapLayer.visibleLayer || now - lastHit < throttleMs || interactiveMap.view.scale > minScale) {
        return
      }
      lastHit = now
      const layersToTest = FloodMapLayer.visibleLayer.allLayers || [FloodMapLayer.visibleLayer]
      interactiveMap.view.hitTest(e, { include: layersToTest }).then((response) => {
        if (response?.results?.length > 0) {
          // Now do an additional check for the SW layers, in case we are hovering over a hidden SW style layer
          // if it is NOT a SW layer, then FloodMapLayer.visibleLayer.isStyleLayerIdVisible will always return true.
          const { layerId } = response?.results?.[0]?.graphic?.origin || {}
          document.body.style.cursor = FloodMapLayer.visibleLayer.isStyleLayerIdVisible(layerId) ? 'pointer' : 'default'
          return
        }
        document.body.style.cursor = 'default'
      })
    })

    interactiveMap.view.on('pointer-leave', _e => {
      document.body.style.cursor = 'default'
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
