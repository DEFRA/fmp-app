const TileLayer = require('ol/layer/Tile').default
const TileWMS = require('ol/source/TileWMS').default
const TileGrid = require('ol/tilegrid/TileGrid').default
const Icon = require('ol/style/Icon').default
const ScaleLine = require('ol/control/ScaleLine').default
const FullScreen = require('ol/control/FullScreen').default

const createTileLayer = mapConfig => {
  return new TileLayer({
    ref: 'fmp',
    opacity: 0.7,
    zIndex: 0,
    source: new TileWMS({
      url: mapConfig.tileProxy,
      serverType: 'geoserver',
      params: {
        LAYERS: 'fmp:fmp',
        TILED: true,
        VERSION: '1.1.1'
      },
      tileGrid: new TileGrid({
        extent: mapConfig.tileExtent,
        resolutions: mapConfig.tileResolutions,
        tileSize: mapConfig.tileSize
      })
    })
  })
}

// let visibleProbabilityLayer = '1 in 30'
// let visibleZoneLayer = 'zone2and3'
const surfaceWaterLayers = {}
const riversAndSeaLayers = {}

const createNafra2Layer = (mapConfig, LAYERS, name, probability, type) => {
  const ref = LAYERS.split(':')[1]
  if (type === 'SW') {
    surfaceWaterLayers[name] = false
  } else {
    riversAndSeaLayers[name] = false
  }

  return {
    ref,
    name,
    probability,
    type,
    layer: new TileLayer({
      ref,
      opacity: 0.7,
      zIndex: 0,
      visible: false,
      source: new TileWMS({
        url: mapConfig.tileProxy,
        serverType: 'geoserver',
        params: {
          LAYERS,
          TILED: false,
          VERSION: '1.1.1'
        },
        tileGrid: new TileGrid({
          extent: mapConfig.tileExtent,
          resolutions: mapConfig.tileResolutions,
          tileSize: mapConfig.tileSize
        })
      })
    })
  }
}

let nafra2Layers = []

const getMapLayers = (mapConfig, options) => {
  if (options.nafra2Layers) {
    nafra2Layers = [
      // createNafra2Layer(mapConfig, 'fmp:fmp', 'Legacy Flood Zones 2 & 3', ''),
      // Rivers and Sea
      createNafra2Layer(mapConfig, 'fmp:flood_zone_2_3_rivers_and_sea', 'Rivers and sea - flood zones 2 and 3', 'zone2and3', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:flood_zone_2_3_rivers_and_sea_ccp1', 'Rivers and sea - flood zones 2 and 3 CC1', 'zone2and3', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:flood_zone_2_3_rivers_and_sea_ccp2', 'Rivers and sea - flood zones 2 and 3 CC2', 'zone2and3', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:flood_zone_river_sea_present_day', 'Rivers and sea - present day', 'zone2and3', 'RS'),

      createNafra2Layer(mapConfig, 'fmp:rivers_1in1000_sea_1in1000_defended_depth', 'RS - 1 in 1000 defended depth', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in1000_sea_1in1000_defended_depth_ccp1', 'RS - 1 in 1000 defended depth CC1', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in1000_sea_1in1000_defended_depth_ccp2', 'RS - 1 in 1000 defended depth CC2', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in1000_sea_1in1000_undefended_depth', 'RS - 1 in 1000 undefended depth', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in1000_sea_1in1000_undefended_depth_ccp1', 'RS - 1 in 1000 undefended depth CC1', 'delete', 'RS'),

      createNafra2Layer(mapConfig, 'fmp:rivers_1in100_sea_1in200_defended_depth', 'RS - 1 in 1000 undefended depth CC2', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in100_sea_1in200_defended_depth_ccp1', 'rivers 1 in 100, sea 1 in 200 defended depth', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in100_sea_1in200_defended_depth_ccp2', 'rivers 1 in 100, sea 1 in 200 defended depth CC1', 'delete', 'RS'),

      createNafra2Layer(mapConfig, 'fmp:rivers_1in100_sea_1in200_undefended_depth', 'rivers 1 in 100, sea 1 in 200 undefended depth', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in100_sea_1in200_undefended_depth_ccp1', 'rivers 1 in 100, sea 1 in 200 undefended depth CC1', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in100_sea_1in200_undefended_depth_ccp2', 'rivers 1 in 100, sea 1 in 200 undefended depth CC2', 'delete', 'RS'),

      createNafra2Layer(mapConfig, 'fmp:rivers_1in30_sea_1in30_defended', 'rivers and sea 1 in 30 defended', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in30_sea_1in30_defended_ccp1', 'rivers and sea 1 in 30 defended CC1', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in30_sea_1in30_defended_ccp2', 'rivers and sea 1 in 30 defended CC2', 'delete', 'RS'),

      createNafra2Layer(mapConfig, 'fmp:rivers_1in30_sea_1in30_defended_depth', 'rivers and sea 1 in 30 defended depth', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in30_sea_1in30_defended_depth_ccp1', 'rivers and sea 1 in 30 defended depth CC1', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:rivers_1in30_sea_1in30_defended_depth_ccp2', 'rivers and sea 1 in 30 defended depth CC2', 'delete', 'RS'),

      // Surface Water
      createNafra2Layer(mapConfig, 'fmp:flood_zone_surface_water_present_day', 'Surface water - present day ', 'delete', 'RS'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in1000_depth', 'Surface water - 1 in 1000 depth', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in1000_depth_ccp1', 'Surface water - 1 in 1000 depth CC1', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in1000_depth_ccp2', 'Surface water - 1 in 1000 depth CC2', 'delete', 'SW'),

      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in100_1in1000', 'Surface water - 1 in 100 river 1 in 1000 sea', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in100_1in1000_ccp1', 'Surface water - 1 in 100 river 1 in 1000 sea CC1', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in100_1in1000_ccp2', 'Surface water - 1 in 100 river 1 in 1000 sea CC2', 'delete', 'SW'),

      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in100_depth', 'Surface water - 1 in 100 depth', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in100_depth_ccp1', 'Surface water - 1 in 100 depth CC1', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in100_depth_ccp2', 'Surface water - 1 in 100 depth CC2', 'delete', 'SW'),

      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in30', 'Surface water - 1 in 30', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in30_ccp1', 'Surface water - 1 in 30 CC1', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in30_ccp2', 'Surface water - 1 in 30 CC2', 'delete', 'SW'),

      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in30_depth', 'Surface water - 1 in 30 depth', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in30_depth_ccp1', 'Surface water - 1 in 30 depth CC1', 'delete', 'SW'),
      createNafra2Layer(mapConfig, 'fmp:surface_water_spatial_planning_1in30_depth_ccp2', 'Surface water - 1 in 30 depth CC2', 'delete', 'SW')
    ]
    return nafra2Layers.map((nafra2Layer) => nafra2Layer.layer)
  }
  return [createTileLayer(mapConfig)]
}

const buildLayerFragment = (fragment, layerSet, layerName) => {
  const div = fragment.appendChild(document.createElement('div'))
  div.className = 'layer-toggle-container'
  const input = div.appendChild(document.createElement('input'))
  input.setAttribute('type', 'checkbox')
  input.setAttribute('id', layerName)
  input.setAttribute('name', layerName)
  input.checked = false
  input.addEventListener('change', (event) => {
    layerSet[layerName] = event.target.checked
    showHideLayers()
  })
  const label = div.appendChild(document.createElement('label'))
  label.setAttribute('for', layerName)
  label.textContent = layerName
}

// const addRadioClickEvents = (elementName) => {
//   const radios = document.getElementsByName(elementName)
//   Array.from(radios).forEach((radio) => {
//     radio.onclick = (event) => {
//       if (elementName === 'probability') {
//         visibleProbabilityLayer = event.target.value
//       } else {
//         visibleZoneLayer = event.target.value
//       }
//       showHideLayers()
//     }
//   })
// }

const addBaseMapRadioClickEvents = (map, elementName) => {
  const radios = document.getElementsByName(elementName)
  Array.from(radios).forEach((radio) => {
    radio.onclick = (event) => {
      map.setVisibleBaseMapLayer(event.target.value)
    }
  })
}

const populateMapLayerList = (map) => {
  // addRadioClickEvents('zone')
  // addRadioClickEvents('probability')
  addBaseMapRadioClickEvents(map, 'base-map')

  const riversAndSeaFragment = document.createDocumentFragment()
  Object.keys(riversAndSeaLayers).forEach((layerName) => buildLayerFragment(riversAndSeaFragment, riversAndSeaLayers, layerName))
  document.querySelector('#rivers-and-sea-layers').appendChild(riversAndSeaFragment)

  const surfaceWaterFragment = document.createDocumentFragment()
  Object.keys(surfaceWaterLayers).forEach((layerName) => buildLayerFragment(surfaceWaterFragment, surfaceWaterLayers, layerName))
  document.querySelector('#surface-water-layers').appendChild(surfaceWaterFragment)
}

const showHideLayers = () => {
  nafra2Layers.forEach((nafra2Layer) => {
    const showLayer = nafra2Layer.type === 'SW' ? surfaceWaterLayers[nafra2Layer.name] : riversAndSeaLayers[nafra2Layer.name]
    // This is the logic to reinstate if we decide to return to a radio button for the probability
    // &(
    //   nafra2Layer.probability === '' ||
    //   nafra2Layer.probability === visibleProbabilityLayer ||
    //   nafra2Layer.probability === visibleZoneLayer
    // )
    nafra2Layer.layer.setVisible(showLayer)
  })
}

let sessionStorageAvailable = true
try {
  sessionStorageAvailable = Boolean(window.sessionStorage)
} catch (ex) {
  // stop an error being logged in the browser when sessionStorage is turned off
  sessionStorageAvailable = false
}

const _mockSessionStorageAvailable = value => {
  const currentValue = sessionStorageAvailable
  sessionStorageAvailable = value
  return currentValue
}

const mapState = {
  getItem: name => sessionStorageAvailable
    ? window.sessionStorage.getItem(name)
    : undefined,
  setItem: (name, value) => sessionStorageAvailable
    ? window.sessionStorage.setItem(name, value)
    : undefined,
  removeItem: name => sessionStorageAvailable
    ? window.sessionStorage.removeItem(name)
    : undefined
}

const getCenterOfExtent = extent => {
  const X = extent[0] + (extent[2] - extent[0]) / 2
  const Y = extent[1] + (extent[3] - extent[1]) / 2
  return [parseInt(X, 10), parseInt(Y, 10)]
}

function getTargetUrl (featureMode, polygon, point, location) {
  let coordinates
  let url = '/flood-zone-results'

  if (featureMode === 'polygon' && polygon) {
    const geometry = polygon.getGeometry()
    coordinates = geometry.getCoordinates()[0]
    const extent = geometry.getExtent()
    const center = getCenterOfExtent(extent)
    const coords = JSON.stringify(coordinates.map(function (item) {
      return [Math.round(item[0]), Math.round(item[1])]
    }))
    url += '?polygon=' + coords
    url += '&center=' + JSON.stringify(center)
  } else {
    coordinates = point.getGeometry().getCoordinates()
    url += '?easting=' + Math.round(coordinates[0])
    url += '&northing=' + Math.round(coordinates[1])
  }
  url += '&location=' + location
  return url
}

const getPolygonNodeIcon = resolution => {
  const icon = new Icon({
    opacity: 1,
    size: [32, 32],
    scale: 0.5,
    src: '/assets/images/map-draw-cursor-2x.png'
  })
  if (!isNaN(resolution)) {
    resolution = 1 + parseFloat(resolution, 10)
    const scale = 0.5 / resolution
    icon.setScale(scale)
  }
  return icon
}

const roundCoordinates = valueOrArray => {
  if (Array.isArray(valueOrArray)) {
    return valueOrArray.map(item => roundCoordinates(item))
  } else {
    return Math.round(valueOrArray)
  }
}

const snapCoordinates = shape => {
  // FCRM-3763 - ensure the coordinates are whole eastings/northings
  // This is required as we dont snap when the resolution is high, as building the array of points at runtime is
  // far too slow.
  // It is possible to zoom in and out while we are digitising so it's possible to have a polygon with some snapped
  // points and some unsnapped. This call ensures that all points are snapped.
  // The side effect is a subtle shift in the point that has been clicked when resolution is high,
  // but the level of detail is such that it is barely noticeable
  const geometry = shape.getGeometry()
  const coordinates = geometry.getCoordinates()
  const newCoordinates = roundCoordinates(coordinates)
  geometry.setCoordinates(newCoordinates)
  return shape
}

const getCartesianViewExtents = map => {
  const view = map.getView()
  const resolution = view.getResolution()
  if (resolution > 0.25) {
    return [undefined, undefined]
  }
  const extent = map.getView().calculateExtent(map.getSize())
  const topLeft = extent.slice(0, 2).map(value => Math.floor(value))
  const bottomRight = extent.slice(2, 4).map(value => Math.ceil(value))
  return [topLeft, bottomRight]
}

const extendMapControls = allowFullScreen => {
  const scaleLine = new ScaleLine({ units: 'metric', minWidth: 50 })
  return allowFullScreen ? [scaleLine, new FullScreen({ source: 'map--result' })] : [scaleLine]
}

module.exports = {
  createTileLayer,
  getMapLayers,
  populateMapLayerList,
  mapState,
  _mockSessionStorageAvailable,
  getTargetUrl,
  getPolygonNodeIcon,
  roundCoordinates,
  snapCoordinates,
  getCartesianViewExtents,
  extendMapControls
}
