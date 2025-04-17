// /flood-map Path defined as an alias to npm or submodule version in webpack alias
import { FloodMap } from '/flood-map' // eslint-disable-line import/no-absolute-path
import { getEsriToken, getRequest, getInterceptors, getDefraMapConfig, setEsriConfig, isInvalidTokenError } from './tokens.js'
import { renderInfo, renderList } from './infoRenderer'
import { terms } from './terms.js'
import { colours, getKeyItemFill, LIGHT_INDEX, DARK_INDEX } from './colours.js'
import { siteBoundaryHelp } from './markUpItems.js'
import { onRiversAndSeasMenuItem, initialiseRiversAndSeasWarnings } from './riversAndSeasWarning.js'
import { vtLayers, surfaceWaterStyleLayers } from './vtLayers.js'

const mapDiv = document.getElementById('map')

const vtLayerIds = vtLayers.map(vtLayer => vtLayer.name)

const symbols = {
  waterStorageAreas: '/assets/images/water-storage.svg',
  floodDefences: '/assets/images/flood-defence.svg',
  mainRivers: '/assets/images/main-rivers.svg'
}

const keyItemDefinitions = {
  floodZone2: {
    // id: 'fz2',
    label: 'Flood zone 2',
    fill: getKeyItemFill(colours.floodZone2)
  },
  floodZone3: {
    // id: 'fz2',
    label: 'Flood zone 3',
    fill: getKeyItemFill(colours.floodZone3)
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
  }
}

// floodZoneSymbolIndex is used to infer the _symbol value sent to the query feature when a layer is clicked
// we believe it depends on the order of the styles that are set on the flood zones vector tile layer
// and it is used to infer the flood zone that has been clicked on by a user.
// On a previous data set, these values were in the reverse order so we need to verify that they remain correct
// after a data upload to arcGis
const floodZoneSymbolIndex = ['3', '2']

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
const polygonQuery = queryParams.get('polygon')
let featureQuery, extent
if (polygonQuery) {
  featureQuery = {
    type: 'feature',
    geometry: {
      type: 'polygon',
      coordinates: JSON.parse(polygonQuery)
    }
  }
  extent = calculateExtent(JSON.parse(polygonQuery))
}

getDefraMapConfig().then((defraMapConfig) => {
  const getVectorTileUrl = (layerName) => `${defraMapConfig.agolVectorTileUrl}/${layerName + defraMapConfig.layerNameSuffix}/VectorTileServer`
  const getFeatureLayerUrl = (urlLayerName) => `${defraMapConfig.agolServiceUrl}/${urlLayerName}/FeatureServer`
  const getModelFeatureLayerUrl = (layerName) => `${defraMapConfig.agolServiceUrl}/${layerName + defraMapConfig.featureLayerNameSuffix}/FeatureServer`

  const paintProperties = {
    'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1': colours.floodZone2,
    'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1': colours.floodZone3,
    'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 3/1': colours.floodZone3,
    'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 2/1': colours.floodZone2,
    'Rivers 1 in 30 Sea 1 in 30 Defended/1': colours.nonFloodZone,
    'Rivers 1 in 30 Sea 1 in 30 Defended Extents/1': colours.nonFloodZone,
    'Rivers 1 in 100 Sea 1 in 200 Defended Extents/1': colours.nonFloodZone,
    'Rivers 1 in 100 Sea 1 in 200 Undefended Extents/1': colours.nonFloodZone,
    'Rivers 1 in 1000 Sea 1 in 1000 Defended Extents/1': colours.nonFloodZone,
    'Rivers 1 in 1000 Sea 1 in 1000 Undefended Extents/1': colours.nonFloodZone,
    'Rivers 1 in 30 Sea 1 in 30 Defended CCP1/1': colours.nonFloodZone,
    'Rivers 1 in 30 Sea 1 in 30 Defended Extents CCP1/1': colours.nonFloodZone,
    'Rivers 1 in 100 Sea 1 in 200 Defended Extents CCP1/1': colours.nonFloodZone,
    'Rivers 1 in 100 Sea 1 in 200 Undefended Extents CCP1/1': colours.nonFloodZone,
    'Rivers 1 in 1000 Sea 1 in 1000 Defended Extents CCP1/1': colours.nonFloodZone,
    'Rivers 1 in 1000 Sea 1 in 1000 Undefended Extents CCP1/1': colours.nonFloodZone,
    [surfaceWaterStyleLayers[0]]: colours.nonFloodZone,
    [surfaceWaterStyleLayers[1]]: colours.nonFloodZone,
    [surfaceWaterStyleLayers[2]]: colours.nonFloodZone,
    [surfaceWaterStyleLayers[3]]: colours.nonFloodZone,
    [surfaceWaterStyleLayers[4]]: colours.nonFloodZone,
    [surfaceWaterStyleLayers[5]]: colours.nonFloodZone
    // , [surfaceWaterCcLowStyleLayers[0]]: [nonFloodZoneDepthBandsLight[6], nonFloodZoneDepthBandsDark[6]],
    // [surfaceWaterCcLowStyleLayers[1]]: [nonFloodZoneDepthBandsLight[5], nonFloodZoneDepthBandsDark[5]],
    // [surfaceWaterCcLowStyleLayers[2]]: [nonFloodZoneDepthBandsLight[4], nonFloodZoneDepthBandsDark[4]],
    // [surfaceWaterCcLowStyleLayers[3]]: [nonFloodZoneDepthBandsLight[3], nonFloodZoneDepthBandsDark[3]],
    // [surfaceWaterCcLowStyleLayers[4]]: [nonFloodZoneDepthBandsLight[2], nonFloodZoneDepthBandsDark[2]],
    // [surfaceWaterCcLowStyleLayers[5]]: [nonFloodZoneDepthBandsLight[1], nonFloodZoneDepthBandsDark[1]]
  }

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
    return mapFeatureRenderers[name][mode]
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

  const setStylePaintProperties = (vtLayer, vectorTileLayer, isDark) => {
    vtLayer.styleLayers.forEach((styleLayerName) => {
      const layerPaintProperties = vectorTileLayer.getPaintProperties(styleLayerName)
      if (layerPaintProperties) {
        const fillColour = paintProperties[styleLayerName][isDark ? 1 : 0]
        layerPaintProperties['fill-color'] = fillColour
        vectorTileLayer.setPaintProperties(styleLayerName, layerPaintProperties)
      }
    })
    // Un comment this section to infer the styleLayers for each vector layer
    // They don't seem to be defined anywhere server side, so Paul is anxious that
    // they may change when new layers are published.
    // const { styleRepository = {} } = vectorTileLayer
    // const { layers: styleLayers = [] } = styleRepository
    // styleLayers.forEach((styleLayer) => {
    //   console.log(styleLayer.id)
    // })
  }
  const addLayers = async () => {
    return Promise.all([
      /* eslint-disable */
      import(/* webpackChunkName: "esri-sdk" */ '/@arcgis-path/core/layers/VectorTileLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '/@arcgis-path/core/layers/FeatureLayer.js')
      /* eslint-enable */
    ]).then(modules => {
      const VectorTileLayer = modules[0].default
      const FeatureLayer = modules[1].default
      vtLayers.forEach((vtLayer) => {
        if (!vtLayer.q) {
          return
        }
        const vectorTileLayer = new VectorTileLayer({
          id: vtLayer.name,
          url: getVectorTileUrl(vtLayer.name),
          opacity: 0.75,
          visible: false
        })
        floodMap.map.add(vectorTileLayer)
      })
      fLayers.forEach(fLayer => {
        floodMap.map.add(new FeatureLayer({
          id: fLayer.name,
          url: fLayer.url,
          renderer: getMapFeatureRenderer(fLayer.name),
          visible: false
        }))
      })
    })
  }

  const toggleVisibility = (type, mode, segments, layers, map, isDark) => {
    const isDrawMode = ['frame', 'draw'].includes(mode)
    vtLayers.forEach((vtLayer, i) => {
      if (!vtLayer.q) {
        return
      }
      const id = vtLayer.name
      const layer = map.findLayerById(id)
      const isVisible = !isDrawMode && segments.join('') === vtLayer.q
      layer.visible = isVisible
      setStylePaintProperties(vtLayer, layer, isDark)
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

  // const depthMap = ['over 2.3', '2.3', '1.2', '0.9', '0.6', '0.3', '0.15']
  const osAccountNumber = defraMapConfig.OS_ACCOUNT_NUMBER
  const currentYear = new Date().getFullYear()
  const osAttributionHyperlink = `<a href="/os-terms" class="os-credits__link"> Contains OS data &copy; Crown copyright and database rights ${currentYear} </a>`
  const osMasterMapAttributionHyperlink = `<a href="/os-terms" class="os-credits__link">&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber} </a>`

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
    symbols: [symbols.waterStorageAreas, symbols.floodDefences, symbols.mainRivers],
    transformSearchRequest: getRequest,
    interceptorsCallback: getInterceptors,
    tokenCallback: getEsriToken,
    styles: [
      {
        name: 'default',
        url: '/map/styles/base-map-default',
        attribution: osAttributionHyperlink
      },
      {
        name: 'dark',
        url: '/map/styles/base-map-dark',
        attribution: osAttributionHyperlink
      }
    ],
    search: {
      label: 'Search for a place',
      isAutocomplete: true,
      isExpanded: false,
      country: 'england'
    },
    legend: {
      width: '280px',
      isVisible: true,
      title: 'Menu',
      keyWidth: '360px',
      keyDisplay: 'min',
      segments: [{
        heading: 'Datasets',
        items: [
          {
            id: 'fz',
            label: 'Flood zones 2 and 3'
          },
          {
            id: 'rsd',
            label: 'River and sea with defences'
          },
          {
            id: 'rsu',
            label: 'River and sea without defences'
          },
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
        heading: 'Time frame',
        parentIds: ['rsd', 'rsu'],
        items: [
          {
            id: 'pd',
            label: 'Present day'
          },
          {
            id: 'cl',
            label: 'Climate change'
          }
        ]
      },
      {
        id: 'af1',
        heading: 'Annual likelihood of flooding',
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
        heading: 'Annual likelihood of flooding',
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
        id: 'af2',
        heading: 'Annual likelihood of flooding',
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
          heading: 'Map features',
          parentIds: ['fz'],
          items: [
            keyItemDefinitions.floodZone2,
            keyItemDefinitions.floodZone3,
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        },
        {
          heading: 'Map features',
          parentIds: ['rsd', 'rsu', 'sw'],
          items: [
            keyItemDefinitions.floodExtents,
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        },
        {
          heading: 'Map features',
          parentIds: ['mo'],
          items: [
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        }
      ]
    },
    queryArea: {
      heading: 'Get a boundary report',
      startLabel: 'Add site boundary',
      editLabel: 'Edit site boundary',
      addLabel: 'Add boundary',
      updateLabel: 'Update boundary',
      submitLabel: 'Get summary report',
      helpLabel: 'How to draw a shape',
      keyLabel: 'Report area',
      html: siteBoundaryHelp,
      minZoom: 17,
      maxZoom: 21,
      styles: [
        {
          name: 'default',
          url: '/map/styles/polygon-default',
          attribution: osMasterMapAttributionHyperlink
        },
        {
          name: 'dark',
          url: '/map/styles/polygon-dark',
          attribution: osMasterMapAttributionHyperlink
        }
      ],
      feature: featureQuery // feature derived from polygon query string or null if not present
    },
    queryLocation: {
      layers: vtLayers.map(vtLayer => vtLayer.name)
    }
  }, (esriMapObjects) => {
    const { esriConfig } = esriMapObjects
    mapState.esriConfig = esriConfig
    setEsriConfig(esriConfig)
  })

  const mapState = {
    isDark: false,
    isRamp: false,
    layers: [],
    segments: []
  }

  // Component is ready and we have access to map
  // We can listen for map events now, such as 'loaded'
  floodMap.addEventListener('ready', async e => {
    const { mode, segments, layers, style } = e.detail
    mapState.segments = segments
    mapState.layers = layers
    mapState.isDark = style?.name === 'dark'
    mapState.isRamp = layers.includes('md')
    console.log('ready mapState', mapState)
    await addLayers()
    initialiseRiversAndSeasWarnings(mapState, floodMap)
    setTimeout(() => toggleVisibility(null, mode, segments, layers, floodMap.map, mapState.isDark), 1000)

    floodMap.view.on('pointer-move', e => {
      floodMap.view.hitTest(e).then((response) => {
        // Get the Ids of layers mouse has moved oved
        const layerIds = response.results.map(result => result.layer.id)
        // Check if any of the hits are one of the vtlayers
        const vtLayerHit = layerIds.filter(id => vtLayerIds.includes(id))
        // If hit then change mouse to pointer
        if (vtLayerHit.length > 0) {
          document.body.style.cursor = 'pointer'
        } else {
          document.body.style.cursor = 'default'
        }
      })
    })
    floodMap.view.on('pointer-leave', _e => {
      document.body.style.cursor = 'default'
    })
  })

  // Listen for mode, segments, layers or style changes
  floodMap.addEventListener('change', e => {
    const { type, mode, segments, layers, style } = e.detail
    mapState.segments = segments
    mapState.layers = layers
    if (style) {
      mapState.isDark = style.name === 'dark' || style === 'dark'
    }
    mapState.isRamp = layers.includes('md')
    console.log('onChange mapState', mapState)
    if (['layer', 'segment'].includes(type)) {
      floodMap.setInfo(null)
    }
    const map = floodMap.map
    if (type === 'segment') {
      onRiversAndSeasMenuItem()
    }
    toggleVisibility(type, mode, segments, layers, map, mapState.isDark)
  })

  const getPolygon = () => {
    const { items: layers } = floodMap.map.layers
    const polygonLayer = layers[layers.length - 1]
    const { graphics } = polygonLayer
    const { items } = graphics
    const { geometry } = items[0]
    const { rings } = geometry
    return roundPolygon(rings[0])
  }

  mapDiv.addEventListener('appaction', e => {
    const { type } = e.detail
    if (type === 'confirmPolygon' || type === 'updatePolygon') {
      const url = new URL(window.location)
      const polygon = getPolygon()
      url.searchParams.set('polygon', JSON.stringify(polygon))
      url.search = decodeURIComponent(url.search)
      window.history.replaceState(null, '', url)
    }
    if (type === 'deletePolygon') {
      const url = new URL(window.location)
      url.searchParams.delete('polygon')
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

  const getModelFeatureLayer = async (coords, layerName) => {
    const [{ default: FeatureLayer }, { default: Point }] = await Promise.all([
      /* eslint-disable */
      import(/* webpackChunkName: "esri-sdk" */ '/@arcgis-path/core/layers/FeatureLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '/@arcgis-path/core/geometry/Point.js')
      /* eslint-enable */
    ])

    const model = new FeatureLayer({ url: getModelFeatureLayerUrl(layerName) })

    const results = await model.queryFeatures({
      geometry: new Point({ x: coords[0], y: coords[1], spatialReference: 27700 }),
      outFields: ['*'],
      spatialRelationship: 'intersects',
      distance: 1,
      units: 'meters',
      returnGeometry: false
    })
    const attributes = results.features.length ? results.features[0].attributes : undefined
    return attributes
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
      // TODO - version 0.4.0 of defra-map, will remove the need to
      // hack the polygon layer like this.
      const polygon = getPolygon()
      window.location = `/results?polygon=${JSON.stringify(polygon)}`
    }
  })

  const getFloodZoneAttributes = async (coord, feature) => {
    try {
      return await getModelFeatureLayer(coord, feature.layer)
    } catch (error) {
      if (isInvalidTokenError(error)) {
        const { token } = await getEsriToken(true) // forceRefresh = true
        mapState.esriConfig.apiKey = token
        return getModelFeatureLayer(coord, feature.layer)
      }
      console.log('unexpected error caught when calling getModelFeatureLayer', error)
      return undefined
    }
  }

  const getQueryContentHeader = async (e) => {
    const { coord, features } = e.detail
    if (!features || !coord) {
      return {}
    }
    const listContents = [
      ['Easting and northing', `${Math.round(coord[0])},${Math.round(coord[1])}`],
      ['Timeframe', mapState.segments.includes('cl') ? 'Climate change' : 'Present day']
    ]
    const feature = features.isPixelFeaturesAtPixel ? features.items[0] : null
    const vtLayer = feature && vtLayers.find(vtLayer => vtLayer.name === feature.layer)
    return { listContents, vtLayer, coord, feature }
  }

  const addQueryFloodZonesContent = async (listContents, feature, coord) => {
    if (!mapState.segments.includes('fz')) {
      return false
    }
    const floodZone = floodZoneSymbolIndex[feature?._symbol] || '1'
    listContents.push(['Flood zone', floodZone])

    if (floodZone !== '1') {
      const attributes = await getFloodZoneAttributes(coord, feature)
      if (attributes && attributes.flood_source) {
        listContents.push(['Flood source', formatFloodSource(attributes.flood_source)])
      }
    }
    return floodZone
  }

  const addQueryNonFloodZonesContent = (listContents, vtLayer) => {
    // This part is applicable for non Flood_Zones layers, when an area outside
    // of a zone has been clicked
    const dataset = getDataset()
    if (dataset) {
      listContents.push(['Dataset', dataset])
    }
    if (vtLayer?.likelihoodLabel) {
      listContents.push(['Annual exceedance probability (AEP)', vtLayer.likelihoodLabel])
    }
    if (vtLayer?.chanceLabel) {
      listContents.push(['Annual likelihood of flooding', vtLayer.chanceLabel])
    }
    if (vtLayer?.likelihoodchanceLabel) {
      listContents.push(['Annual exceedance probability (AEP)', vtLayer.likelihoodchanceLabel])
    }
  }

  const getClimateChangeExtraContent = () => (mapState.segments.includes('cl'))
    ? `
    <h2 class="govuk-heading-s">Climate change allowances</h2>
    <ul class="govuk-list govuk-list--bullet">
      <li class='govuk-body-s'>
        these have been taken from the Environment Agency's 
        <a href="https://www.gov.uk/guidance/flood-risk-assessments-climate-change-allowances" contenteditable="false" style="cursor: pointer;">
          Flood risk assessment: climate change allowances
        </a>
      </li>
      <li class='govuk-body-s'>
        river flooding uses the 'central' allowance, based on the 50th percentile for the 2080s epoch
      </li>
      <li class='govuk-body-s'>
        sea and tidal flooding uses the 'upper end' allowance, based on the 95th percentile for 2125
      </li>
    </ul>`
    : ''

  const getFloodZonesExtraContent = () => (mapState.segments.includes('fz'))
    ? `
    <h2 class="govuk-heading-s">Updates to flood zones 2 and 3</h2>
    <p class="govuk-body-s">
      Flood zones 2 and 3 have been updated to include local detailed models, and a new improved national model.
    </p>`
    : ''

  const getQueryExtraContent = (vtLayer) => {
    let extraContent = vtLayer?.additionalInfo || ''
    if (!vtLayer && mapState?.segments.find((item) => item === 'rsd' || item === 'rsu')) {
      // Ensure the Caveat shows for Rivers and Seas - even if a non RS area is clicked
      extraContent = terms.additionalInfo.rsHigh
    }

    extraContent += getClimateChangeExtraContent()
    extraContent += getFloodZonesExtraContent()
    return extraContent
  }

  // Listen to map queries
  floodMap.addEventListener('query', async e => {
    const { listContents, vtLayer, feature, coord } = await getQueryContentHeader(e)
    if (!listContents) {
      return
    }
    const floodZone = await addQueryFloodZonesContent(listContents, feature, coord)
    if (!floodZone) {
      addQueryNonFloodZonesContent(listContents, vtLayer)
    }

    floodMap.setInfo(renderInfo(renderList(listContents), getQueryExtraContent(vtLayer)))
  })
})
