var $ = require('jquery')
var ol = require('openlayers')
var Map = require('../map')
var mapConfig = require('../map-config.json')
var VectorDrag = require('../vector-drag')
var vectorDragInteraction = new VectorDrag()

function ConfirmLocationPage (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

  var $page = $('main#confirm-location-page')
  var $radios = $('.radio-button-group', $page)
  var $container = $('.map-container', $page)
  var $continueBtn = $('a.continue')
  var $legend = $('.legend')

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
        src: 'public/images/map-draw-cursor-2x.png'
      })
    })

    // Complete polygon geometry style
    var drawCompleteGeometryStyle = new ol.style.Style({
      image: new ol.style.Icon({
        opacity: 1,
        size: [32, 32],
        scale: 0.5,
        src: 'public/images/map-draw-cursor-2x.png'
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
        src: 'public/images/pin.png'
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

  // Start polygon drawing style
  var drawStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.5)'
    }),
    stroke: new ol.style.Stroke({
      color: '#005EA5',
      width: 3
    }),
    image: new ol.style.Icon({
      opacity: 1,
      size: [32, 32],
      scale: 0.5,
      src: '/public/images/map-draw-cursor-2x.png'
    })
  })

  // Modify polygon drawing style
  var modifyStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.5)'
    }),
    stroke: new ol.style.Stroke({
      color: '#FFBF47',
      width: 3
    }),
    image: new ol.style.Icon({
      opacity: 1,
      size: [32, 32],
      scale: 0.5,
      src: '/public/images/map-draw-cursor-2x.png'
    })
  })

  var modify = new ol.interaction.Modify({
    source: vectorSource,
    style: modifyStyle
  })

  var draw = new ol.interaction.Draw({
    source: vectorSource,
    type: 'Polygon',
    style: drawStyle
  })

  var snap = new ol.interaction.Snap({
    source: vectorSource
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
    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    }).extend([vectorDragInteraction])
  }

  this.map = new Map(mapOptions)

  this.map.onReady(function (map) {
    var polygon
    var featureMode = 'point'

    if (options.polygon) {
      // Load polygon from saved state
      polygon = new ol.Feature({
        geometry: new ol.geom.Polygon([options.polygon])
      })
      updateMode()
    }

    modify.on('modifyend', function (e) {
      // Update polygon and targetUrl
      var features = e.features.getArray()
      polygon = features[0]
      updateTargetUrl()
    })

    draw.on('drawend', function (e) {
      var coordinates = e.feature.getGeometry().getCoordinates()[0]
      if (coordinates.length >= 4) {
        // Update polygon and targetUrl
        polygon = e.feature
        updateTargetUrl()
        setTimeout(function () {
          map.removeInteraction(draw)
        }, 500)
      }
    })

    $container.on('click', '.enter-fullscreen', function (e) {
      e.preventDefault()
      $page.addClass('fullscreen')
      map.updateSize()
    })

    $container.on('click', '.exit-fullscreen', function (e) {
      e.preventDefault()
      $page.removeClass('fullscreen')
      map.updateSize()
    })

    $radios.on('click', 'label', function (e) {
      updateMode()
    })

    // Click handler for pointer
    map.on('singleclick', function (e) {
      if (featureMode === 'point') {
        point.getGeometry().setCoordinates([e.coordinate[0], e.coordinate[1]])
        updateTargetUrl()
      }
    })

    function updateMode () {
      if (featureMode === 'point') {
        // Remove the point feature
        vectorSource.removeFeature(point)

        // Add the polygon draw interaction to the map
        map.addInteraction(modify)
        map.addInteraction(snap)

        if (polygon) {
          vectorSource.addFeature(polygon)
        } else {
          map.addInteraction(draw)
        }

        // add polygon class to legend to hide point and show polygon icon
        $legend.addClass('polygon')

        featureMode = 'polygon'
      } else {
        // Remove the polygon draw interaction to the map
        map.removeInteraction(modify)
        map.removeInteraction(draw)
        map.removeInteraction(snap)

        if (polygon) {
          vectorSource.removeFeature(polygon)
        }

        // Add the point feature
        vectorSource.addFeature(point)

        // add polygon class to legend to hide point and show polygon icon
        $legend.removeClass('polygon')

        featureMode = 'point'
      }

      updateTargetUrl()
    }

    function updateTargetUrl () {
      var coordinates
      var url = '/summary'

      if (featureMode === 'polygon' && polygon) {
        coordinates = polygon.getGeometry().getCoordinates()[0]
        url += '?polygon=' + JSON.stringify(coordinates.map(function (item) {
          return [parseInt(item[0], 10), parseInt(item[1], 10)]
        }))
        url += '&center=' + JSON.stringify(getCenterOfExtent(polygon.getGeometry().getExtent()))
      } else {
        coordinates = point.getGeometry().getCoordinates()
        url += '?easting=' + parseInt(coordinates[0], 10) + '&northing=' + parseInt(coordinates[1], 10)
      }

      $continueBtn.attr('href', url)
    }

    function getCenterOfExtent (extent) {
      var X = extent[0] + (extent[2] - extent[0]) / 2
      var Y = extent[1] + (extent[3] - extent[1]) / 2
      return [parseInt(X, 10), parseInt(Y, 10)]
    }
  })
}

module.exports = ConfirmLocationPage
