const $ = require('jquery')
const proj4 = require('proj4').default //  JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations
const raf = require('raf') // requestAnimationFrame polyfill for node and the browser.

const WMTSCapabilities = require('ol/format/WMTSCapabilities').default
const WMTS = require('ol/source/WMTS').default
const Proj = require('ol/proj')
const TileLayer = require('ol/layer/Tile').default
const OLMap = require('ol/Map').default
const ScaleLine = require('ol/control/ScaleLine').default
const View = require('ol/View').default
const { register } = require('ol/proj/proj4')
const { optionsFromCapabilities } = require('ol/source/WMTS')

const parser = new WMTSCapabilities()

const config = require('./map-config.json')
let map, callback

function Map (mapOptions) {
  // add the projection to Window.proj4
  proj4.defs(config.projection.ref, config.projection.proj4)
  register(proj4)

  // ie9 requires polyfill for window.requestAnimationFrame and classlist
  raf.polyfill()
  require('classlist-polyfill')

  const projection = Proj.get(config.projection.ref)

  projection.setExtent(config.projection.extent)

  $.when($.get(config.OSGetCapabilities)).done(function (OS) {
    // bug: parser is not getting the matrixwidth and matrixheight values when parsing,
    // therefore sizes is set to undefined array, which sets fullTileRanges_
    // to an array of undefineds thus breaking the map      return

    const result = parser.read(OS)

    const wmtsOptions = optionsFromCapabilities(result, {
      layer: config.OSLayer,
      matrixSet: config.OSMatrixSet
    })

    wmtsOptions.attributions = []

    const source = new WMTS(wmtsOptions)
    source.setUrls([config.OSWMTS])

    const layer = new TileLayer({
      ref: config.OSLayer,
      source
    })

    const layers = Array.prototype.concat([layer], mapOptions.layers)

    // Prevent map from zooming in too far
    const resolutions = source.tileGrid.getResolutions().slice(0, 11)

    map = new OLMap({
      interactions: [],
      controls: [
        new ScaleLine({
          units: 'metric',
          minWidth: 100
        })
      ],
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

    if (mapOptions.polygon) {
      map.getView().fit(mapOptions.polygon)
    }

    map.setLayerVisible = function (ref, visible) {
      map.getLayers().forEach(function (layer) {
        if (layer.get('ref') === ref) {
          layer.setVisible(visible)
        }
      })
    }

    // Callback to notify map is ready
    if (callback) {
      callback(map)
    }
  })

  this.onReady = function (fn) {
    callback = fn
  }
}

module.exports = Map
