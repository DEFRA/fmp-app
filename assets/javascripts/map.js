var $ = require('jquery')
// proj4 is accessed using global variable within openlayers library
window.proj4 = require('proj4')
var raf = require('raf')
var ol = require('openlayers')
var parser = new ol.format.WMTSCapabilities()
var config = require('./map-config.json')
var map, callback

function loadMap (point, fmpLayer) {
  // add the projection to Window.proj4
  window.proj4.defs(config.projection.ref, config.projection.proj4)

  // ie9 requires polyfill for window.requestAnimationFrame
  raf.polyfill()

  var projection = ol.proj.get(config.projection.ref)

  projection.setExtent(config.projection.extent)

  $.when($.get(config.OSGetCapabilities)).done(function (OS) {
    // bug: parser is not getting the matrixwidth and matrixheight values when parsing,
    // therefore sizes is set to undefined array, which sets fullTileRanges_
    // to an array of undefineds thus breaking the map      return
    var result = parser.read(OS)
    // TODO
    // need to set tiles to https
    // follow up with OS
    result.OperationsMetadata.GetTile.DCP.HTTP.Get[0].href = result.OperationsMetadata.GetTile.DCP.HTTP.Get[0].href.replace('http://', 'https://')
    var options = ol.source.WMTS.optionsFromCapabilities(result, {
      layer: config.OSLayer,
      matrixSet: config.OSMatrixSet
    })

    options.attributions = [
      new ol.Attribution({
        html: config.OSAttribution
      })
    ]

    var source = new ol.source.WMTS(options)

    // array of ol.tileRange can't find any reference to this object in ol3 documentation, but is set to NaN and stops the map from functioning
    // openlayers doesn't expose fulltileranges as a property, so when using minified ol have to set tilegrid.a to null, which is what fulltileranges
    // is mapped as, hopefully OS will fix their service, otherwise something more robust needs sorting out
    source.tileGrid.fullTileRanges_ = null
    source.tileGrid.b = null

    var layer = new ol.layer.Tile({
      ref: config.OSLayer,
      source: source
    })
    var layers = []
    // add the base map layer
    layers.push(layer)

    if (fmpLayer) {
      layers.push(new ol.layer.Image({
        ref: 'fmp',
        source: new ol.source.ImageWMS({
          url: '/wms-proxy',
          serverType: 'geoserver',
          params: {
            'LAYERS': 'fmp'
          }
        })
      }))
    }

    map = new ol.Map({
      controls: ol.control.defaults().extend([
        new ol.control.ScaleLine({
          units: 'imperial',
          minWidth: 128
        })
      ]),
      layers: layers,
      target: 'map',
      view: new ol.View({
        resolutions: source.tileGrid.getResolutions(),
        projection: projection,
        center: point || [440000, 310000],
        zoom: point ? 9 : 0,
        extent: config.projection.extent
      })
    })
    map.on('singleclick', function (e) {
    })
    // Callback to notify map is ready
    if (callback) {
      callback()
    }
  })
}

module.exports = {
  loadMap: loadMap,
  onReady: function (fn) {
    callback = fn
  }
}
