/* global $ */

var ol = require('openlayers')
var Map = require('../map')
var dialog = require('../dialog')
var mapConfig = require('../map-config.json')

function Summary (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

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
        zIndex: 0,
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
        zIndex: 1,
        source: new ol.source.Vector({
          features: [
            new ol.Feature({
              geometry: new ol.geom.Point([parseInt(easting, 10), parseInt(northing, 10)])
            })]
        }),
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: '../../public/images/pin.png'
          })
        })
      })
    ],
    mapInteractions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })
  }
  var setBlendMode = function (evt) {
    evt.context.globalCompositeOperation = 'multiply'
  }

  var resetBlendModeFromSelect = function (evt) {
    evt.context.globalCompositeOperation = 'source-over'
  }

  mapOptions.layers[0].on('precompose', setBlendMode)
  mapOptions.layers[0].on('postcompose', resetBlendModeFromSelect)

  this.map = new Map(mapOptions)

  function isMobile () {
    return $('.visible-mobile:visible').length > 0
  }

  function sizeColumn () {
    var height = !isMobile() ? $summaryColumn.height() : 450
    $map.height(height)
  }

  // set start height
  sizeColumn()

  $(window).on('resize', sizeColumn)

  this.map.onReady(function (map) {
    var id, cookieTimer, cookiePattern
    var cookieName = 'pdf-download'

    function checkCookies () {
      // If the local cookies have been updated, clear the timer
      if (document.cookie.search(cookiePattern) >= 0) {
        clearInterval(cookieTimer)
        dialog.closeDialog()
      }
    }

    $('#report form').submit(function () {
      // Create the `id` variable. This is echoed back as
      // the cookie value to nitify the download is complete
      id = (new Date()).getTime()
      $('input[name=id][type=hidden]', this).val(id)
      cookiePattern = new RegExp(cookieName + '=' + id, 'i')

      dialog.closeDialog()
      dialog.openDialog('#report-downloading')

      cookieTimer = window.setInterval(checkCookies, 500)
    })

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
      $map.css('height', $summaryColumn.height() + 'px')
      map.updateSize()
    })
  })
}

module.exports = Summary
