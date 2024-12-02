import { FloodMap } from '../../../node_modules/@defra/flood-map/src/flood-map.js'
import { getEsriToken, getRequest, getInterceptors, getDefraMapConfig } from './tokens.js'

const symbols = {
  waterStorageAreas: '/assets/images/water-storage.svg',
  floodDefences: '/assets/images/flood-defence.svg'
}

const keyItemDefinitions = {
  floodZone1: {
    // id: 'fz1',
    label: 'Flood zone 1',
    fill: '#00A4CD'
  },
  floodZone2: {
    // id: 'fz2',
    label: 'Flood zone 2',
    fill: '#003078'
  },
  waterStorageAreas: {
    id: 'fsa',
    label: 'Water storage',
    icon: symbols.waterStorageAreas,
    fill: 'default: #12393d, dark: #12393d'
  },
  floodDefences: {
    id: 'fd',
    label: 'Flood defence',
    icon: symbols.floodDefences,
    fill: '#12393d'
  },
  mainRivers: {
    id: 'mainr',
    label: 'Main Rivers',
    icon: symbols.floodDefences,
    fill: '#f47738'
  },
  floodExtents: {
    // id: 'fz1',
    label: 'Flood extent',
    fill: 'default: #ff0000, dark: #00ff00'
  }
}

getDefraMapConfig().then((defraMapConfig) => {
  const getVectorTileUrl = (layerName) => `${defraMapConfig.agolVectorTileUrl}/${layerName + defraMapConfig.layerNameSuffix}/VectorTileServer`
  const getFeatureLayerUrl = (layerName) => `${defraMapConfig.agolServiceUrl}/${layerName}/FeatureServer`

  const vtLayers = [
    {
      name: 'Flood_Zones_2_and_3_Rivers_and_Sea',
      q: 'fz',
      styleLayers: [
        'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1',
        'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1'
      ]
    },
    {
      name: 'Flood_Zones_2_and_3_Rivers_and_Sea_CCP1',
      q: '',
      styleLayers: [
        'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 3/1',
        'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 2/1'
      ]
    },
    {
      name: 'Rivers_1_in_30_Sea_1_in_30_Defended',
      q: '',
      styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended/1']
    },
    {
      name: 'Rivers_1_in_30_Sea_1_in_30_Defended_Depth',
      q: 'rsdpdhr',
      styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended Depth/1']
    },
    {
      name: 'Rivers_1_in_100_Sea_1_in_200_Defended_Depth',
      q: 'rsdpdmr',
      styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Defended Depth/1']
    },
    {
      name: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Depth',
      q: 'rsupdmr',
      styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Undefended Depth/1']
    },
    {
      name: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Depth',
      q: 'rsdpdlr',
      styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Defended Depth/1']
    },
    {
      name: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Depth',
      q: 'rsupdlr',
      styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Undefended Depth/1']
    },
    {
      name: 'Rivers_1_in_30_Sea_1_in_30_Defended_CCP1',
      q: '',
      styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended CCP1/1']
    },
    {
      name: 'Rivers_1_in_30_Sea_1_in_30_Defended_Depth_CCP1',
      q: 'rsdclhr',
      styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended Depth CCP1/1']
    },
    {
      name: 'Rivers_1_in_100_Sea_1_in_200_Defended_Depth_CCP1',
      q: 'rsdclmr',
      styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Defended Depth CCP1/1']
    },
    {
      name: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Depth_CCP1',
      q: 'rsuclmr',
      styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Undefended Depth CCP1/1']
    },
    {
      name: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Depth_CCP1',
      q: 'rsdcllr',
      styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Defended Depth CCP1/1']
    },
    {
      name: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Depth_CCP1',
      q: 'rsucllr',
      styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Undefended Depth CCP1/1']
    }
  ]

  const nonFloodZoneLight = '#2b8cbe'
  const nonFloodZoneDark = '#7fcdbb'
  const floodZone2Light = '#1d70b8'
  const floodZone2Dark = '#41ab5d'
  const floodZone3Light = '#003078'
  const floodZone3Dark = '#e5f5e0'

  // These will require reinstating when depth band data is available
  // // light tones > 2300 to < 150
  // const nonFloodZoneDepthBandsLight = ['#7f2704', '#a63603', '#d94801', '#f16913', '#fd8d3c', '#fdae6b', '#fdd0a2']
  // // GREENS dark tones > 2300 to < 150
  // const nonFloodZoneDepthBandsDark = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45']
  // // BLUES dark tones > 2300 to < 150
  // // const nonFloodZoneDepthBandsDark = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5']

  const paintProperties = {
    'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1': [floodZone2Light, floodZone2Dark],
    'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1': [floodZone3Light, floodZone3Dark],
    'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 3/1': [floodZone3Light, floodZone3Dark],
    'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 2/1': [floodZone2Light, floodZone2Dark],
    'Rivers 1 in 30 Sea 1 in 30 Defended/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 30 Sea 1 in 30 Defended Depth/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 100 Sea 1 in 200 Defended Depth/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 100 Sea 1 in 200 Undefended Depth/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 1000 Sea 1 in 1000 Defended Depth/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 1000 Sea 1 in 1000 Undefended Depth/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 30 Sea 1 in 30 Defended CCP1/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 30 Sea 1 in 30 Defended Depth CCP1/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 100 Sea 1 in 200 Defended Depth CCP1/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 100 Sea 1 in 200 Undefended Depth CCP1/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 1000 Sea 1 in 1000 Defended Depth CCP1/1': [nonFloodZoneLight, nonFloodZoneDark],
    'Rivers 1 in 1000 Sea 1 in 1000 Undefended Depth CCP1/1': [nonFloodZoneLight, nonFloodZoneDark]
  }

  const fLayers = [
    { n: 'nat_defences', q: 'fd' },
    { n: 'nat_fsa', q: 'fsa' },
    { n: 'Statutory_Main_River_Map', q: 'mainr' }
  ]

  const setStylePaintProperties = (vtLayer, vectorTileLayer, isDark) => {
    vtLayer.styleLayers.forEach((styleLayerName) => {
      const layerPaintProperties = vectorTileLayer.getPaintProperties(styleLayerName)
      if (layerPaintProperties) {
        const fillColour = paintProperties[styleLayerName][isDark ? 1 : 0]
        layerPaintProperties['fill-color'] = fillColour
        layerPaintProperties['fill-opacity'] = 0.75
        vectorTileLayer.setPaintProperties(styleLayerName, layerPaintProperties)
      }
    })
    // const { styleRepository = {} } = vectorTileLayer
    // const { layers: styleLayers = [] } = styleRepository
    // styleLayers.forEach((styleLayer) => {
    //   console.log(styleLayer.id)
    //   const fillColour = paintProperties[styleLayer.id][isDark ? 1 : 0]
    //   const layerPaintProperties = vectorTileLayer.getPaintProperties(styleLayer.id)
    //   layerPaintProperties['fill-color'] = fillColour
    //   layerPaintProperties['fill-opacity'] = 0.75
    //   // vectorTileLayer.setPaintProperties(styleLayer.id, { 'fill-color': fillColour, 'fill-opacity': 0.75 })
    //   vectorTileLayer.setPaintProperties(styleLayer.id, layerPaintProperties)
    // })
  }

  const addLayers = async () => {
    return Promise.all([
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/VectorTileLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/FeatureLayer.js')
    ]).then(modules => {
      const VectorTileLayer = modules[0].default
      const FeatureLayer = modules[1].default
      vtLayers.forEach((vtLayer) => {
        const vectorTileLayer = new VectorTileLayer({
          id: vtLayer.name,
          url: getVectorTileUrl(vtLayer.name),
          visible: false
          // style: {
          //   version: 8,
          //   sources: {
          //     esri: {
          //       type: 'vector',
          //       minzoom: 4,
          //       maxzoom: 16,
          //       scheme: 'xyz',
          //       // url: '../../'
          //       url: `https://tiles.arcgis.com/tiles/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/${vtLayer.name + defraMapConfig.layerNameSuffix}/VectorTileServer/resources/styles/root.json`
          //     }
          //   },
          //   // layers: Array(i === 0 ? 2 : 7).fill(0).map((_, j) => {
          //   layers: vtLayer.styleLayers.map((styleLayerName, j) => {
          //     return {
          //       id: styleLayerName,
          //       type: 'fill',
          //       source: 'esri',
          //       'source-layer': vtLayer.name.replaceAll('_', ' '),
          //       minzoom: 4.7597,
          //       filter: ['==', '_symbol', j],
          //       layout: {
          //         visibility: 'visible'
          //       },
          //       paint: {
          //         'fill-color': paintProperties[styleLayerName][0],
          //         'fill-opacity': 0.75
          //       }
          //     }
          //   })
          // }
        })
        // vectorTileLayer.on('load', (event) => {
        //   setStylePaintProperties(vtLayer, vectorTileLayer, 0)
        // })
        // vectorTileLayer.watch('visible', (visibility, a, eventName, layer) => {
        //   console.log('visible: ', visibility)
        //   console.log(layer, eventName, a)
        //   if (visibility) {
        //     setStylePaintProperties(vtLayer, layer, 0)
        //   }
        // })
        floodMap.map.add(vectorTileLayer)
      })
      fLayers.forEach(layer => {
        floodMap.map.add(new FeatureLayer({
          id: layer.n,
          url: getFeatureLayerUrl(layer.n),
          renderer: layer.n === 'nat_defences' ? renderFloodDefence() : renderFloodStorage(),
          visible: false
        }))
      })
    })
  }

  const renderFloodDefence = () => {
    return {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        width: '2px',
        color: '#f47738'
      }
    }
  }

  const renderFloodStorage = () => {
    return {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        style: 'diagonal-cross',
        color: '#d4351c',
        outline: {
          color: '#d4351c',
          width: 1
        }
      }
    }
  }

  const toggleVisibility = (type, mode, segments, layers, map, isDark) => {
    const isDrawMode = ['frame', 'draw'].includes(mode)
    vtLayers.forEach((vtLayer, i) => {
      const id = vtLayer.name
      const layer = map.findLayerById(id)
      const isVisible = !isDrawMode && segments.join('') === vtLayer.q
      layer.visible = isVisible
      setStylePaintProperties(vtLayer, layer, isDark)
    })
    fLayers.forEach(l => {
      const layer = map.findLayerById(l.n)
      const isVisible = !isDrawMode && layers.includes(l.q)
      layer.visible = isVisible
    // Re-colour feature layers
    })
  }

  const depthMap = ['over 2.3', '2.3', '1.2', '0.9', '0.6', '0.3', '0.15']

  const floodMap = new FloodMap('map', {
    type: 'hybrid',
    place: 'England',
    zoom: 7.7,
    minZoom: 6,
    maxZoom: 20,
    centre: [340367, 322766],
    height: '100%',
    hasGeoLocation: true,
    framework: 'esri',
    symbols: [symbols.waterStorageAreas, symbols.floodDefences],
    requestCallback: getRequest,
    styles: {
      tokenCallback: getEsriToken,
      interceptorsCallback: getInterceptors,
      defaultUrl: '/map/styles/base-map-default',
      darkUrl: '/map/styles/base-map-dark'
    },
    search: {
      label: 'Search for a place',
      isAutocomplete: true,
      isExpanded: false
    },
    legend: {
      width: '280px',
      isVisible: true,
      title: 'Menu',
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
        collapse: 'collapse',
        parentIds: ['rsd', 'rsu', 'sw'],
        items: [
          {
            id: 'pd',
            label: 'Present day'
          },
          {
            id: 'cl',
            label: '2040\'s to 2060\'s'
          }
        ]
      },
      {
        id: 'af1',
        heading: 'Annual likelihood of flooding',
        collapse: 'collapse',
        parentIds: ['rsd', 'sw'],
        items: [
          {
            id: 'hr',
            label: 'Above 3.3%'
          },
          {
            id: 'mr',
            label: '0.1% to 0.5%'
          },
          {
            id: 'lr',
            label: 'Below 0.1%'
          }
        ]
      },
      {
        id: 'af2',
        heading: 'Annual likelihood of flooding',
        collapse: 'collapse',
        parentIds: ['rsu'],
        items: [
          {
            id: 'mr',
            label: '0.1% to 0.5%'
          },
          {
            id: 'lr',
            label: 'below 0.1%'
          }
        ]
      }
      ],
      key: [
      //   {
      //     heading: 'Flood extent and depth',
      //     parentIds: ['pd', 'cl'],
      //     collapse: 'collapse',
      //     type: 'radio',
      //     items: [
      //       {
      //         id: 'na',
      //         label: 'Hidden'
      //       },
      //       keyItemDefinitions.floodExtents,
      //       {
      //         id: 'md',
      //         label: 'Maximum depth in metres',
      //         display: 'ramp',
      //         numLabels: 3,
      //         items: [
      //           {
      //             label: 'above 2.3',
      //             fill: 'default: #08589e, dark: #00ff00'
      //           },
      //           {
      //             label: '2.3',
      //             fill: '#2b8cbe'
      //           },
      //           {
      //             label: '1.2',
      //             fill: '#4eb3d3'
      //           },
      //           {
      //             label: '0.9',
      //             fill: '#7bccc4'
      //           },
      //           {
      //             label: '0.6',
      //             fill: '#a8ddb5'
      //           },
      //           {
      //             label: '0.3',
      //             fill: '#ccebc5'
      //           },
      //           {
      //             label: '0.15',
      //             fill: '#f0f9e8'
      //           }
      //         ]
      //       }
      //     ]
      //   },
      //   {
      //     heading: 'Map features',
      //     parentIds: ['fz'],
      //     collapse: 'collapse',
      //     items: [
      //       {
      //         id: 'fz23',
      //         label: 'Flood zones',
      //         isSelected: true,
      //         items: [
      //           keyItemDefinitions.floodZone1,
      //           keyItemDefinitions.floodZone2
      //         ]
      //       },
      //       keyItemDefinitions.waterStorageAreas,
      //       keyItemDefinitions.floodDefences
      //     ]
      //   },
      //   {
      //     heading: 'Map features',
      //     parentIds: ['pd', 'cl'],
      //     collapse: 'collapse',
      //     items: [
      //       keyItemDefinitions.waterStorageAreas,
      //       keyItemDefinitions.floodDefences
      //     ]
      //   },
        {
          heading: 'Map features',
          parentIds: ['fz'],
          collapse: 'collapse',
          items: [
            keyItemDefinitions.floodZone1,
            keyItemDefinitions.floodZone2,
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        },
        {
          heading: 'Map features',
          parentIds: ['rsd', 'rsu', 'sw'],
          collapse: 'collapse',
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
          collapse: 'collapse',
          items: [
            keyItemDefinitions.waterStorageAreas,
            keyItemDefinitions.floodDefences,
            keyItemDefinitions.mainRivers
          ]
        }
      ]
    },
    queryPolygon: {
      heading: 'Get a boundary  report',
      startLabel: 'Add site boundary',
      editLabel: 'Edit site boundary',
      addLabel: 'Add boundary',
      updateLabel: 'Update boundary',
      submitLabel: 'Get site report',
      helpLabel: 'How to draw a shape',
      keyLabel: 'Report area',
      html: '<p class="govuk-body-s">Instructions</p>',
      defaultUrl: '/map/styles/polygon-default',
      darkUrl: '/map/styles/polygon-dark',
      minZoom: 12,
      maxZoom: 21
    },
    queryPixel: vtLayers.map(vtLayer => vtLayer.name)
  })

  // Component is ready and we have access to map
  // We can listen for map events now, such as 'loaded'
  floodMap.addEventListener('ready', async e => {
    const { mode, segments, layers, basemap } = e.detail
    // const { basemap } = e.detail
    const isDark = basemap === 'dark'
    // isRamp = layers.includes('md')
    await addLayers(layers)
    setTimeout(() => toggleVisibility(null, mode, segments, layers, floodMap.map, isDark), 1000)
  })

  // Listen for mode, segments, layers or style changes
  floodMap.addEventListener('change', e => {
    const { type, mode, segments, layers, basemap } = e.detail
    if (['layer', 'segment'].includes(type)) {
      floodMap.info = null
    }
    // const { basemap } = e.detail
    const isDark = basemap === 'dark'
    // isRamp = layers.includes('md')
    const map = floodMap.map
    toggleVisibility(type, mode, segments, layers, map, isDark)
  })

  // Listen to map queries
  floodMap.addEventListener('query', e => {
    const { coord, features } = e.detail
    const feature = features.isPixelFeaturesAtPixel ? features.items[0] : null

    if (!feature) {
      floodMap.info = {
        width: '360px',
        label: 'Title',
        html: `
                <p class="govuk-body-s">No feature info</p>
            `
      }
      return
    }

    const name = feature.layer.split('_VTP')[0]
    const layer = vtLayers.find(vtLayer => vtLayer.name === name)

    Promise.all([
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/FeatureLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Point.js')
    ]).then(modules => {
      const FeatureLayer = modules[0].default
      const Point = modules[1].default
      Promise.resolve({ FeatureLayer, Point })
    }).then((FeatureLayer, Point) => layer.m
      ? () => {
          const model = new FeatureLayer({
            url: getFeatureLayerUrl(layer.n)
          })
          model.queryFeatures({
            geometry: new Point({ x: coord[0], y: coord[1], spatialReference: 27700 }),
            outFields: ['*'],
            spatialRelationship: 'intersects',
            distance: 1,
            units: 'meters',
            returnGeometry: false
          }).then(results => {
            if (results.features.length) {
              Promise.resolve(results.features[0].attributes)
            } else {
              Promise.resolve(null)
            }
          })
        }
      : Promise.resolve()).finally(attributes => {
      const band = feature._symbol
      const layerName = feature.layer
      const isFloodZone = layerName.includes('Zone')
      const title = isFloodZone
        ? `<strong>Flood zone</strong>: ${band + 2}<br>`
        : `<strong>Maximum depth:</strong> ${depthMap[band]}metres<br/>`
      const model = attributes
        ? `
          <strong>Model:</strong> ${attributes.model}</br/>
          <strong>Model year:</strong> ${attributes.model_year}
      `
        : ''
      floodMap.info = {
        width: '360px',
        label: 'Title',
        html: `
        <p class="govuk-body-s">${title}${model}</p>
        <p class="govuk-body-s govuk-!-margin-top-1">${layerName}</p>
        <p class="govuk-body-s govuk-!-margin-bottom-0">Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?" 1914 translation by H. Rackham "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"</p>
      `
      }
    })
  })
})
