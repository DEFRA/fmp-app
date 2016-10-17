var $ = require('jquery')
var ol = require('openlayers')
var Map = require('../map')
var VectorDrag = require('../vector-drag')

function ConfirmLocationPage (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

  var $page = $('main#confirm-location-page')
  var $map = $('#map', $page)
  var $confirmColumn = $('.confirm-column', $page)
  var $container = $('.map-container', $page)
  var $mapColumn = $('.map-column', $page)

  var mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [
      new ol.layer.Vector({
        ref: 'centre',
        visible: true,
        source: new ol.source.Vector({
          features: [
            new ol.Feature({
              geometry: new ol.geom.Point([parseInt(easting, 10), parseInt(northing, 10)])
            })
          ]
        }),
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'public/images/pin.png'
          })
        })
      })
    ],
    // Add vector drag to map interactions
    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    }).extend([new VectorDrag()])
  }

  this.map = new Map(mapOptions)

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
      $map.css('height', $confirmColumn.height() + 'px')
      map.updateSize()
    })

    // Click handler for pointer
    map.on('singleclick', function (e) {
      map.getLayers().forEach(function (layer) {
        if (layer.getProperties().ref === 'centre') {
          layer.getSource().getFeatures().forEach(function (feature) {
            return feature.getGeometry().setCoordinates([e.coordinate[0], e.coordinate[1]])
          })
        }
      })
    })

    // Point movement handler
    map.getLayers().forEach(function (layer) {
      if (layer.getProperties().ref === 'centre') {
        layer.getSource().getFeatures()[0].on('change', function (e) {
          var coordinates = e.target.getGeometry().getCoordinates()
          $('a[data-id="continue"]').attr('href', '/summary/' + parseInt(coordinates[0], 10) + '/' + parseInt(coordinates[1], 10))
        })
      }
    })
  })
}

module.exports = ConfirmLocationPage
