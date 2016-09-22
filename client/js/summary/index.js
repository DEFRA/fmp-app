/* global $ */
var ol = require('openlayers')
var Map = require('../map.js')
var mapConfig = require('../map-config.json')

function Summary (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)
  var mapHeight = window.encodeURIComponent(options.mapHeight)

  var $summaryColumn = $('.summary-column')
  var $map = $('#map')

  var mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [
      new ol.layer.Tile({
        ref: 'fmp',
        opacity: 0.7,
        source: new ol.source.TileWMS({
          url: mapConfig.tileProxy,
          serverType: 'geoserver',
          params: {
            LAYERS: 'fmp:fmp',
            TILED: true,
            VERSION: '1.1.1'
          },
          tileGrid: new ol.tilegrid.TileGrid({
            extent: mapConfig.tileExtent,
            resolutions: mapConfig.tileResolutions,
            tileSize: mapConfig.tileSize
          })
        })
      })
    ],
    mapInteractions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })
  }
  this.map = new Map(mapOptions)

  // set start height
  $map.height(mapHeight)

  window.onresize = function () {
    if ($('.visible-mobile:visible').length > 0) {
      $map.height(450)
    } else {
      $map.height($summaryColumn.height())
    }
  }
}

module.exports = Summary
