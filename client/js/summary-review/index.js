var ol = require('openlayers')
var Map = require('../summary-review-map')
var mapConfig = require('../map-config.json')

function ApplicationSummaryReviewPage (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

  var point = new ol.Feature({
    geometry: new ol.geom.Point([parseInt(easting, 10), parseInt(northing, 10)])
  })

  var vectorSource = new ol.source.Vector({
    features: [
      point
    ]
  })

  // Styles for features
  var vectorStyle = function (feature, resolution) {
    // Complete polygon drawing style
    var drawCompleteStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: '#B10E1E',
        width: 3
      }),
      image: new ol.style.Icon({
        opacity: 1,
        size: [32, 32],
        scale: 0.5,
        src: '/assets/images/map-draw-cursor-2x.png'
      })
    })

    // Complete polygon geometry style
    var drawCompleteGeometryStyle = new ol.style.Style({
      image: new ol.style.Icon({
        opacity: 1,
        size: [32, 32],
        scale: 0.5,
        src: '/assets/images/map-draw-cursor-2x.png'
      }),
      // Return the coordinates of the first ring of the polygon
      geometry: function (feature) {
        if (feature.getGeometry().getType() === 'Polygon') {
          var coordinates = feature.getGeometry().getCoordinates()[0]
          return new ol.geom.MultiPoint(coordinates)
        } else {
          return null
        }
      }
    })

    // Point style
    var pointStyle = new ol.style.Style({
      image: new ol.style.Icon({
        // size: [53, 71],
        anchor: [0.5, 1],
        // scale: 0.5,
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: '/assets/images/iconfinder_marker.png'
      })
    })

    var featureType = feature.getGeometry().getType()

    if (featureType === 'Polygon') {
      return [drawCompleteStyle, drawCompleteGeometryStyle]
    } else if (featureType === 'Point') {
      return [pointStyle]
    }
  }

  var vectorLayer = new ol.layer.Vector({
    ref: 'centre',
    visible: true,
    source: vectorSource,
    style: vectorStyle
  })

  var mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [new ol.layer.Tile({
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
    vectorLayer],
    // Add vector drag to map interactions
    interactions: []
  }

  this.map = new Map(mapOptions)
}

module.exports = ApplicationSummaryReviewPage
