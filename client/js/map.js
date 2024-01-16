require('./os-branding')
const $ = require('jquery')
const proj4 = require('proj4').default //  JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations
const raf = require('raf') // requestAnimationFrame polyfill for node and the browser.

const WMTSCapabilities = require('ol/format/WMTSCapabilities').default
const WMTS = require('ol/source/WMTS').default
const Proj = require('ol/proj')
const TileLayer = require('ol/layer/Tile').default
const OLMap = require('ol/Map').default
const View = require('ol/View').default
const OSM = require('ol/source/OSM.js').default
const { register } = require('ol/proj/proj4')
const { optionsFromCapabilities } = require('ol/source/WMTS')
const { defaults: InteractionDefaults } = require('ol/interaction')
const { defaults: ControlDefaults } = require('ol/control')
const parser = new WMTSCapabilities()
const { extendMapControls } = require('./map-utils')

const config = require('./map-config.json')
let map, callback

const getBaseMapLayersAndResolutions = (wmtsCapabilities, config, mapOptions) => {
  let resolutions
  let visible = true
  const { limitZoom = true, nafra2Layers = false } = mapOptions
  const baseMapLayersToShow = nafra2Layers ? ['Outdoor_27700', 'Leisure_27700', 'Road_27700', 'Light_27700'] : [config.OSLayer]

  const baseMapLayers = baseMapLayersToShow.map((layerName) => {
    const wmtsOptions = optionsFromCapabilities(wmtsCapabilities, {
      layer: layerName,
      matrixSet: config.OSMatrixSet
    })

    wmtsOptions.attributions = config.OSAttribution.replace('{{year}}', new Date().getFullYear())

    const baseMapSource = new WMTS(wmtsOptions)
    baseMapSource.setUrls([config.OSWMTS])
    // Prevent map from zooming in too far if limitZoom is true
    if (!resolutions) {
      resolutions = limitZoom ? baseMapSource.tileGrid.getResolutions().slice(0, 10) : baseMapSource.tileGrid.getResolutions()
    }

    const baseMapLayer = new TileLayer({
      visible,
      ref: layerName,
      source: baseMapSource
    })
    visible = false // only the first baseMap layer should be visible
    return baseMapLayer
  })

  baseMapLayers.push(new TileLayer({
    source: new OSM(),
    ref: 'OpenStreetMap',
    visible: false
  }))

  return { baseMapLayers, resolutions }
}

function Map (mapOptions) {
  // add the projection to Window.proj4
  proj4.defs(config.projection.ref, config.projection.proj4)
  register(proj4)
  const { allowFullScreen = true } = mapOptions

  // ie9 requires polyfill for window.requestAnimationFrame and classlist
  raf.polyfill()
  require('classlist-polyfill')

  const projection = Proj.get(config.projection.ref)

  projection.setExtent(config.projection.extent)

  $.when($.get(config.OSGetCapabilities)).done(function (OS) {
    // bug: parser is not getting the matrixwidth and matrixheight values when parsing,
    // therefore sizes is set to undefined array, which sets fullTileRanges_
    // to an array of undefineds thus breaking the map      return

    const wmtsCapabilities = parser.read(OS)
    const { baseMapLayers, resolutions } = getBaseMapLayersAndResolutions(wmtsCapabilities, config, mapOptions)
    const layers = Array.prototype.concat(baseMapLayers, mapOptions.layers)

    map = new OLMap({
      interactions: mapOptions.interactions || InteractionDefaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      controls: ControlDefaults({
        rotate: false
      }).extend(extendMapControls(allowFullScreen)),
      layers,
      pixelRatio: 1,
      target: 'map',
      view: new View({
        resolutions,
        projection,
        center: mapOptions.point || [440000, 310000],
        zoom: mapOptions.point ? 9 : 0,
        extent: config.projection.extent
      })
    })

    // FCRM-3762 - stop the map zooming in to the extent of the polygon
    // this fix (ie removing map.getView().fit) was introduced because the
    // increased zoom levels allowed by FCRM-2575 caused the map to zoom in too much
    // if (mapOptions.polygon) {
    //   map.getView().fit(mapOptions.polygon)
    // }

    map.setLayerVisible = function (ref, visible) {
      map.getLayers().forEach(function (layer) {
        if (layer.get('ref') === ref) {
          layer.setVisible(visible)
        }
      })
    }

    map.setVisibleBaseMapLayer = function (ref) {
      baseMapLayers.forEach(function (layer) {
        layer.setVisible(layer.get('ref') === ref)
      })
    }

    // Callback to notify map is ready
    if (callback) {
      callback(map)
      const GOVUK = window.GOVUK
      if (GOVUK && GOVUK.performance && GOVUK.performance.stageprompt) {
        const element = document.getElementById('map--result')
        GOVUK.performance.stageprompt.setupForGoogleAnalytics(element)
      }
      // FCRM-3271 Add ariaLabels to map zoom controls
      const zoomIn = document.getElementsByClassName('ol-zoom-in')[0]
      const zoomOut = document.getElementsByClassName('ol-zoom-out')[0]
      if (zoomIn) {
        zoomIn.ariaLabel = 'Zoom in on map'
      }

      if (zoomOut) {
        zoomOut.ariaLabel = 'Zoom out on map'
      }
    }
  })

  this.onReady = function (fn) {
    callback = fn
  }
}

module.exports = Map
