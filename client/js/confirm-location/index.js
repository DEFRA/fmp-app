var $ = require('jquery')
var ol = require('openlayers')
var Map = require('../map')
var VectorDrag = require('../vector-drag')

function ConfirmLocationPage (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)
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
            }),
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
    // Add vector drag to map interactions
    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    }).extend([new VectorDrag()])
  }

  this.map = new Map(mapOptions)

  this.map.onReady(function (map) {
    // Click handler for pointer
    map.on('singleclick', function (e) {
      map.getLayers().forEach(function (layer) {
        if (layer.getProperties().ref === 'centre') {
          layer.getSource().getFeatures().forEach(function (feature) {
            switch (feature.getGeometry().getType()) {
              case 'Circle':
                return feature.getGeometry().setCenter([e.coordinate[0], e.coordinate[1]])
              case 'Point':
                return feature.getGeometry().setCoordinates([e.coordinate[0], e.coordinate[1]])
              default:
                return
            }
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
