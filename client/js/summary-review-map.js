const $ = require('jquery')
// proj4 is accessed using global variable within openlayers library
window.proj4 = require('proj4') //  JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations
const raf = require('raf') // requestAnimationFrame polyfill for node and the browser.
const ol = require('openlayers')
const parser = new ol.format.WMTSCapabilities()
const config = require('./map-config.json')
let map, callback

function Map (mapOptions) {
  // add the projection to Window.proj4
  window.proj4.defs(config.projection.ref, config.projection.proj4)

  // ie9 requires polyfill for window.requestAnimationFrame and classlist
  raf.polyfill()
  require('classlist-polyfill')

  const projection = ol.proj.get(config.projection.ref)

  projection.setExtent(config.projection.extent)

  $.when($.get(config.OSGetCapabilities)).done(function (OS) {
    // bug: parser is not getting the matrixwidth and matrixheight values when parsing,
    // therefore sizes is set to undefined array, which sets fullTileRanges_
    // to an array of undefineds thus breaking the map      return

    const result = parser.read(OS)

    const wmtsOptions = ol.source.WMTS.optionsFromCapabilities(result, {
      layer: config.OSLayer,
      matrixSet: config.OSMatrixSet
    })

    wmtsOptions.attributions = []

    const source = new ol.source.WMTS(wmtsOptions)
    source.setUrls([config.OSWMTS])

    const layer = new ol.layer.Tile({
      ref: config.OSLayer,
      source: source
    })

    const layers = Array.prototype.concat([layer], mapOptions.layers)

    // Prevent map from zooming in too far
    const resolutions = source.tileGrid.getResolutions().slice(0, 11)

    map = new ol.Map({
      interactions: [],
      controls: [
        new ol.control.ScaleLine({
          units: 'metric',
          minWidth: 100
        })
      ],
      layers: layers,
      pixelRatio: 1,
      target: 'map',
      view: new ol.View({
        resolutions: resolutions,
        projection: projection,
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
