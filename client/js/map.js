var $ = require('jquery')
// proj4 is accessed using global variable within openlayers library
window.proj4 = require('proj4')
var raf = require('raf')
var ol = require('openlayers')
var parser = new ol.format.WMTSCapabilities()
var config = require('./map-config.json')
var map, callback

function Map (mapOptions) {
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
    var wmtsOptions = ol.source.WMTS.optionsFromCapabilities(result, {
      layer: config.OSLayer,
      matrixSet: config.OSMatrixSet
    })

    wmtsOptions.attributions = [
      new ol.Attribution({
        html: config.OSAttribution
      })
    ]

    var source = new ol.source.WMTS(wmtsOptions)

    // array of ol.tileRange can't find any reference to this object in ol3 documentation, but is set to NaN and stops the map from functioning
    // openlayers doesn't expose fulltileranges as a property, so when using minified ol have to set tilegrid.a to null, which is what fulltileranges
    // is mapped as, hopefully OS will fix their service, otherwise something more robust needs sorting out
    source.tileGrid.fullTileRanges_ = null
    source.tileGrid.a = null

    var layer = new ol.layer.Tile({
      ref: config.OSLayer,
      source: source
    })

    var layers = Array.prototype.concat([layer], mapOptions.layers)

    map = new ol.Map({
      interactions: mapOptions.interactions || ol.interaction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      controls: ol.control.defaults().extend([
        new ol.control.ScaleLine({
          units: 'metric',
          minWidth: 50
        })
      ]),
      layers: layers,
      pixelRatio: 1,
      target: 'map',
      view: new ol.View({
        resolutions: source.tileGrid.getResolutions(),
        projection: projection,
        center: mapOptions.point || [440000, 310000],
        zoom: mapOptions.point ? 9 : 0,
        extent: config.projection.extent
      })
    })

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
