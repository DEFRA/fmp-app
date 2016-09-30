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
  var $page = $('main#summary-page')
  var $container = $('.map-container')
  var $mapColumn = $('.map-column')

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
      }),
      new ol.layer.Vector({
        ref: 'centre',
        visible: true,
        source: new ol.source.Vector({
          features: [
            new ol.Feature({
              geometry: new ol.geom.Circle([parseInt(easting, 10), parseInt(northing, 10)], 50)
            })]
        }),
        style: function (feature, resolution) {
          switch (feature.getGeometry().getType()) {
            case 'Circle':
              return new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#000000',
                  width: 2,
                  lineDash: [8, 8]
                })
              })
            case 'Point':
              return new ol.style.Style({
                image: new ol.style.Icon({
                  anchor: [0.5, 1],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'fraction',
                  src: 'public/images/pin.png'
                })
              })
            default:
              return
          }
        }
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

  this.map.onReady(function (map) {
    $container.on('click', '.enter-fullscreen', function (e) {
      e.preventDefault()
      $page.addClass('fullscreen')
      $map.css('height', $(window).height() + 'px')
      $mapColumn.removeClass('column-half')
      map.updateSize()
    })

    $container.on('click', '.exit-fullscreen', function (e) {
      e.preventDefault()
      $page.removeClass('fullscreen')
      $mapColumn.addClass('column-half')

      if ($('.visible-mobile:visible').length > 0) {
        $map.css('height', '450px')
      } else {
        $map.css('height', $summaryColumn.height() + 'px')
      }
      map.updateSize()
    })
  })
}

module.exports = Summary
