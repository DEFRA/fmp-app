// /flood-map Path defined as an alias to npm or submodule version in webpack alias
import { FloodMap } from '/flood-map' // eslint-disable-line import/no-absolute-path
import { getEsriToken, getRequest, getInterceptors, getDefraMapConfig, setEsriConfig } from './tokens.js'
import { renderInfo, renderList } from './infoRenderer'
import { terms } from './terms.js'
import { colours, getKeyItemFill, LIGHT_INDEX, DARK_INDEX } from './colours.js'
import { vtLayers } from './vtLayers.js'
import { setUpBaseMaps } from './baseMap.js'
import { checkParamsForPolygon, encodePolygon } from '../../../server/services/shape-utils.js'
import { sliderMarkUp, initialiseSlider } from './slider/index.js'
import { renderBanner } from './banner.js'
import { FloodMapLayer } from './mapLayers/index.js'
import { getInfoPanel } from './infoPanel.js'
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
    label: 'Climate change (2070 to 2125)', // terms.labels.fzClimateChange
    fill: getKeyItemFill(colours.floodZoneCC)
  },
  floodZoneNoData: {
    label: terms.labels.noData,
    icon: symbols.noData,
    fill: getKeyItemFill(colours.floodZoneNoData)
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

// floodZoneSymbolIndex is used to infer the _symbol value sent to the query feature when a layer is clicked
// we believe it depends on the order of the styles that are set on the flood zones vector tile layer
// and it is used to infer the flood zone that has been clicked on by a user.
// On a previous data set, these values were in the reverse order so we need to verify that they remain correct
// after a data upload to arcGis
// Also the climateChange data is the opposite way round from the non climatechange one
// And  the feature sometimes contains flood_zone
// So this is the best attempt at inferring the flood zone correctly
const floodZoneSymbolIndex = ['3', '2']
const floodZoneCCSymbolIndex = ['2', '3', terms.labels.noData]

const getFloodZoneFromFeature = (feature, mapState) => {
  if (feature.flood_zone === terms.keys.fz2) { return '2' }
  if (feature.flood_zone === terms.keys.fz3) { return '3' }
  if (feature.flood_zone === terms.keys.fzCC) { return 'cc' }
  if (feature.flood_zone === terms.keys.fzNoData) { return 'nd' }
  const symbolIndex = mapState?.isClimateChange ? floodZoneCCSymbolIndex : floodZoneSymbolIndex
  return symbolIndex[feature._symbol]
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
  const getFeatureLayerUrl = (urlLayerName) => `${defraMapConfig.agolServiceUrl}/${urlLayerName}/FeatureServer`
  const getModelFeatureLayerUrl = (layerName) => `${defraMapConfig.agolServiceUrl}/${layerName + defraMapConfig.featureLayerNameSuffix}/FeatureServer`

  const mapFeatureRenderers = {
    floodDefences: {
      default: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          width: '3px',
          color: colours.floodDefences[LIGHT_INDEX]
        }
      },
      dark: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          width: '3px',
          color: colours.floodDefences[DARK_INDEX]
        }
      }
    },
    waterStorageAreas: {
      default: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'diagonal-cross',
          color: colours.waterStorageAreas[LIGHT_INDEX],
          outline: {
            color: colours.waterStorageAreas[LIGHT_INDEX],
            width: 1
          }
        }
      },
      dark: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'diagonal-cross',
          color: colours.waterStorageAreas[DARK_INDEX],
          outline: {
            color: colours.waterStorageAreas[DARK_INDEX],
            width: 1
          }
        }
      }
    },
    mainRivers: {
      default: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          width: '3px',
          color: colours.mainRivers[LIGHT_INDEX]
        }
      },
      dark: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          width: '3px',
          color: colours.mainRivers[DARK_INDEX]
        }
      }
    }
  }

  const getMapFeatureRenderer = (name) => {
    const mode = mapState.isDark ? 'dark' : 'default'
    return mapFeatureRenderers[name]?.[mode]
  }

  const fLayers = [
    {
      name: 'floodDefences',
      url: getModelFeatureLayerUrl('Defences'), // getModelFeatureLayerUrl adds feature layer suffix to layer name eg _NON_PRODUCTION
      q: 'fd'
    },
    {
      name: 'waterStorageAreas',
      url: getModelFeatureLayerUrl('Flood_Storage_Areas'), // getModelFeatureLayerUrl adds feature layer suffix to layer name eg _NON_PRODUCTION
      q: 'fsa'
    },
    {
      name: 'mainRivers',
      url: getFeatureLayerUrl('Statutory_Main_River_Map'), // getFeatureLayerUrl doesn't add a suffix (river map uses same layer for non production and production)
      q: 'mainr'
    }
  ]

  const addLayers = async () => {
    vtLayers.forEach((vtLayer) => {
      if (!vtLayer.q) {
        return
      }
      vtLayer.addToMap(floodMap.map)
    })
    const { FeatureLayer } = FloodMapLayer.modules
    fLayers.forEach(fLayer => {
      floodMap.map.add(new FeatureLayer({
        id: fLayer.name,
        url: fLayer.url,
        renderer: getMapFeatureRenderer(fLayer.name),
        visible: false
      }))
    })
  }

  const toggleVisibility = (type, mode, segments, layers, map, isDark) => {
    const isDrawMode = ['frame', 'vertex'].includes(mode)
    vtLayers.forEach((vtLayer, i) => {
      if (!vtLayer.q) {
        return
      }
      const isVisible = !isDrawMode && vtLayer.checkLayerVisibility()
      vtLayer.visible = isVisible
    })
    fLayers.forEach(fLayer => {
      const layer = map.findLayerById(fLayer.name)
      const isVisible = !isDrawMode && layers.includes(fLayer.q)
      layer.visible = isVisible
      if (isVisible) {
        layer.renderer = getMapFeatureRenderer(fLayer.name)
      }
    })
  }

  const { baseMapStyles, digitisingMapStyles } = setUpBaseMaps(defraMapConfig.OS_ACCOUNT_NUMBER)
  // const depthMap = ['over 2.3', '2.3', '1.2', '0.9', '0.6', '0.3', '0.15']

  const floodMap = new FloodMap('map', {
    behaviour: 'inline',
    place: 'England',
    zoom: 7.7,
    minZoom: 6,
    maxZoom: 20,
    center: !extent && [340367, 322766],
    maxExtent: [0, 0, 700000, 1300000],
    extent, // extent taken from polygon to fit map to drawn feature or null if not present
    height: '100%',
    hasGeoLocation: false,
    framework: 'esri',
    symbols: [symbols.waterStorageAreas, symbols.floodDefences, symbols.mainRivers, symbols.noData],
    transformSearchRequest: getRequest,
    interceptorsCallback: getInterceptors,
    tokenCallback: getEsriToken,
    warningPosition: 'top',
    styles: baseMapStyles,
    helpURL: '/map-help',
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
            label: terms.chance.swMedium
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
            keyItemDefinitions.floodZoneNoData,
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
      styles: digitisingMapStyles,
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
  floodMap.addEventListener('ready', async e => {
    const { mode, segments, layers, style } = e.detail
    updateMapState(segments, layers, style)
    await FloodMapLayer.initialise({
      mapState,
      config: defraMapConfig
    })
    await addLayers()
    setTimeout(() => toggleVisibility(null, mode, segments, layers, floodMap.map, mapState.isDark), 1000)
    initPointerMove()
    initialiseSlider()
    renderBanner(mapState)
  })

  // Listen for mode, segments, layers or style changes
  floodMap.addEventListener('change', e => {
    const { type, mode, segments, layers, style } = e.detail
    updateMapState(segments, layers, style)
    if (['layer', 'segment'].includes(type)) {
      floodMap.setInfo(null)
    }
    const map = floodMap.map
    toggleVisibility(type, mode, segments, layers, map, mapState.isDark)
    renderBanner({ ...mapState, type, mode })
  })

  const initPointerMove = () => {
    let lastHit = 0
    const throttleMs = 20 // Throttle to reduce hitTest usage
    const minScale = 250000 // vector tile layers use minScale value from arcgis online config for visibility
    floodMap.view.on('pointer-move', e => {
      const now = Date.now()
      if (!FloodMapLayer.visibleLayer || now - lastHit < throttleMs || floodMap.view.scale > minScale) {
        return
      }
      lastHit = now
      const layersToTest = FloodMapLayer.visibleLayer.allLayers || [FloodMapLayer.visibleLayer]
      floodMap.view.hitTest(e, { include: layersToTest }).then((response) => {
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

    floodMap.view.on('pointer-leave', _e => {
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

  const getDataset = () => {
    if (mapState.segments.includes('sw')) {
      return 'Surface water'
    }
    if (mapState.segments.includes('rsd')) {
      return 'River and sea with defences'
    }
    if (mapState.segments.includes('rsu')) {
      return 'River and sea without defences'
    }
    return undefined
  }

  const formatFloodSource = (floodSource = '') => {
    if (floodSource === 'Coastal') {
      return 'Sea'
    } else if (floodSource === 'Fluvial') {
      return 'River'
    }
    return floodSource[0].toUpperCase() + floodSource.slice(1)
  }

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

  const getTimeFrame = (feature) => {
    if (mapState.isClimateChange) {
      if (mapState.isFloodZone && feature.flood_zone !== terms.keys.fzCC && feature.flood_zone !== terms.keys.fzNoData) {
        return 'pd'
      }
      return 'cc'
    }
    return 'pd'
  }

  const addGaIdToFeature = (feature) => {
    // add a gaId tag for identifying which feature has been clicked
    feature.gaId = 'info'
    if (mapState.isFloodZone) {
      feature.gaId += `-${feature.flood_zone}`
      if (feature.flood_source) {
        feature.gaId += `-${feature.flood_source.replaceAll(' ', '-')}`
      }
    } else if (mapState.isSurfaceWater) {
      feature.gaId += `-sw-${mapState.riskLevel}`
    } else {
      feature.gaId += '-unknown'
    }
    feature.gaId = feature.gaId.toLowerCase()
  }

  const transformFeature = (features) => {
    if (!features.isPixelFeaturesAtPixel) {
      return null
    }
    const feature = { ...features.items[0] }
    feature.name = feature.name || feature.Name
    feature.flood_source = feature.flood_source || feature.Flood_source
    if (mapState.isFloodZone && mapState.isClimateChange) {
      // This Implies we have clicked on  CC ZONE
      // delete feature.flood_source -- awaiting confirmation from Lloyd on whether to show or hide this if available
      if (feature.name === 'Flood Zones plus climate change') {
        feature.flood_zone = terms.keys.fzCC
      }
      if (feature.name === 'Unavailable') {
        feature.flood_zone = terms.keys.fzNoData
      }
    }
    addGaIdToFeature(feature)

    return feature
  }

  const getQueryContentHeader = (e) => {
    const { coord, features } = e.detail
    if (!features || !coord || !features.isPixelFeaturesAtPixel) {
      return {}
    }
    const feature = transformFeature(features)
    if (!FloodMapLayer.visibleLayer.isDepthVisible(feature.Depth_band)) {
      return {}
    }
    const tf = getTimeFrame(feature)
    const infoPanelValues = { ds: mapState.ds, tf, aep: mapState.riskLevel }
    const listContents = [
      ['Easting and northing', `<span id=${feature.gaId}>${Math.round(coord[0])},${Math.round(coord[1])}</span>`],
      ['Timeframe', tf]
    ]

    const vtLayer = feature && vtLayers.find(vtLayer => vtLayer.name === feature.layer)
    return { listContents, vtLayer, coord, feature, infoPanelValues }
  }

  const addQueryFloodZonesContent = (listContents, feature, infoPanelValues) => {
    if (!mapState.isFloodZone) {
      return ''
    }
    const floodZone = getFloodZoneFromFeature(feature, mapState)
    infoPanelValues.fz = floodZone
    if (feature.flood_source) {
      infoPanelValues.fs = formatFloodSource(feature.flood_source)
    }

    if (floodZone !== terms.keys.fzNoData && floodZone !== terms.keys.fzCC) {
      listContents.push(['Flood zone', floodZone])
    }

    if (floodZone !== terms.keys.fzNoData && feature.flood_source) {
      listContents.push(['Flood Source', formatFloodSource(feature.flood_source)])
    }
    return floodZone
  }

  const addQueryNonFloodZonesContent = (listContents, vtLayer, feature) => {
    // This part is applicable for non Flood_Zones layers, when an area outside
    // of a zone has been clicked
    const dataset = getDataset()
    if (dataset) {
      listContents.push(['Dataset', dataset])
    }
    if (vtLayer?.likelihoodLabel) {
      listContents.push([terms.labels.aep, vtLayer.likelihoodLabel])
    }
    if (vtLayer?.chanceLabel) {
      listContents.push([terms.labels.annualLikelihood, vtLayer.chanceLabel])
    }
    if (vtLayer?.likelihoodchanceLabel) {
      listContents.push([terms.labels.aep, vtLayer.likelihoodchanceLabel])
    }
    if (feature?.Depth_band) {
      listContents.push([terms.labels.depth, feature?.Depth_band])
    }
  }

  const getClimateChangeExtraContent = (floodZone) => (mapState.isClimateChange && floodZone === terms.keys.fzCC)
    ? `
    <h2 class="govuk-heading-s">Climate change allowances</h2>
    <p class="govuk-body-s">
      Flood zones plus climate change uses the following climate change allowances:
    </p>
    <ul class="govuk-list govuk-list--bullet">
      <li class='govuk-body-s'>
        peak river flow 'central' allowance, based on the 50th percentile for the 2080s epoch (2070 to 2125)
      </li>
      <li class='govuk-body-s'>
        sea and tidal flooding 'upper end' allowance to account for cumulative sea level rise to 2125, based on the 95th percentile
      </li>
    </ul>
    <p class="govuk-body-s">
      These have been taken from the Environment Agency's 
        <a href="https://www.gov.uk/guidance/flood-risk-assessments-climate-change-allowances" contenteditable="false" style="cursor: pointer;">
          Flood risk assessment: climate change allowances
        </a>
    </p>
    `
    : ''

  const findOutMoreLink = `<p class="govuk-body-s">
    <a href="/how-to-use-flood-map-for-planning-data">
      Find out more about flood map for planning data and how to use it
    </a>
  </p>`

  const getFloodZonesExtraContent = (floodZone) => {
    if (!mapState.isFloodZone) {
      return ''
    }
    if (floodZone === terms.keys.fzNoData) {
      return `<h2 class="govuk-heading-s">Climate change data unavailable</h2>
        <p class="govuk-body-s">
          In some locations flood zones plus climate change data is not currently available while we make important improvements to our data.
        </p>
        ${findOutMoreLink}`
    } else if (floodZone === terms.keys.fzCC) {
      return `<h2 class="govuk-heading-s">How to use flood zones plus climate change</h2>
        <p class="govuk-body-s">
          The flood zones plus climate change dataset shows how the combined extent of flood
          zones 2 and 3 could increase with climate change over the next century, ignoring the
          benefits of any existing flood defences.
        </p>
        ${findOutMoreLink}`
    } else {
      return `<h2 class="govuk-heading-s">Updates to flood zones 2 and 3</h2>
        <p class="govuk-body-s">
          Flood zones 2 and 3 have been updated to include local detailed models, and a new improved national model.
        </p>`
    }
  }

  const climateChangeAllowances = `<p class="govuk-body-s">
      <a href="https://www.gov.uk/guidance/flood-risk-assessments-climate-change-allowances">
        Flood risk assessment: climate change allowances
      </a>
    </p>`

  const getQueryExtraContent = (floodZone) => {
    let extraContent = ''
    if (floodZone) {
      extraContent += getFloodZonesExtraContent(floodZone)
      extraContent += getClimateChangeExtraContent(floodZone)
    }
    if (mapState.isSurfaceWater) {
      extraContent += `<p class="govuk-body-s">
        Surface water information tells you the flood risk of the land around a building and cannot tell you if individual buildings are at risk.
      </p>`
    }

    if (mapState.isSurfaceWater && mapState.isClimateChange) {
      extraContent += `<h2 class="govuk-heading-s">Climate change allowances</h2>
        <p class="govuk-body-s">
          Surface water with climate change uses the ‘upper end’ allowance for the 2070s epoch (2061 to 2125). 
        </p>

        <p class="govuk-body-s">
          This has been taken from the Environment Agency’s ${climateChangeAllowances}
        </p>
        <p class="govuk-body-s govuk-!-margin-top-4">
          ${findOutMoreLink}
        </p>`
    }
    return extraContent
  }

  const getTitle = (floodZone) => {
    switch (floodZone) {
      case 'nd':
      case 'cc':
        return 'Flood zones plus climate change'
      case '2':
      case '3':
        return 'Flood zones'
      default:
        return getDataset()
    }
  }

  // Listen to map queries
  floodMap.addEventListener('query', async e => {
    const { listContents, vtLayer, feature, infoPanelValues } = getQueryContentHeader(e)
    if (!listContents || !feature) {
      floodMap.setInfo(null)
      return
    }
    const floodZone = addQueryFloodZonesContent(listContents, feature, infoPanelValues)
    if (!floodZone) {
      addQueryNonFloodZonesContent(listContents, vtLayer, feature)
    }
    infoPanelValues.depth = feature?.Depth_band
    const html = await getInfoPanel(infoPanelValues)

    const label = getTitle(floodZone)
    floodMap.setInfo({
      width: '360px',
      label,
      html
    })

    // floodMap.setInfo(renderInfo(renderList(listContents), getQueryExtraContent(floodZone), label))
  })
})
