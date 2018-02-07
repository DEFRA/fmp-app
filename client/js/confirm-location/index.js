var $ = require('jquery')
var ol = require('openlayers')
var Map = require('../map')
// var VectorDrag = require('../vector-drag')

function ConfirmLocationPage (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

  var $page = $('main#confirm-location-page')
  var $map = $('#map', $page)
  var $confirmColumn = $('.confirm-column', $page)
  var $info = $('.info', $confirmColumn)
  var $container = $('.map-container', $page)
  var $mapColumn = $('.map-column', $page)
  var $continueBtn = $('a.continue')

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
        src: 'data:image/png;base64,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'
      })
    })

    // Complete polygon geometry style
    var drawCompleteGeometryStyle = new ol.style.Style({
      image: new ol.style.Icon({
        opacity: 1,
        size: [32, 32],
        scale: 0.5,
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+Gkqr6gAAAYFpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAACiRdZHPK0RRFMc/Bvk1GsXCYhaThtWMBhEbZSSUNI1RBpuZZ36omfF670myVbZTlNj4teAvYKuslSJSUnbWxIbpOc+bmknm3M49n/u995zuPRcckYyS1WsCkM0ZWng86JmLznvqXmjCTQP9uGKKro6EQlNUtM97qqx467dqVT73rzUtJXQFquqFhxVVM4QnhKfWDNXiHeE2JR1bEj4T9mlyQeE7S4/b/GpxyuZvi7VIeBQcLcKeVBnHy1hJa1lheTnebGZVKd7HeokzkZudkdgh7kYnzDhBPEwyxigD9DAk8wB+eumWFRXyA7/506xIriKzyjoay6RIY+ATdVWqJyQmRU/IyLBu9f9vX/VkX69d3RmE2mfTfO+Eum0o5E3z68g0C8dQ/QSXuVL+yiEMfoieL2neA3BtwvlVSYvvwsUWtD+qMS32K1WLO5JJeDuF5ii03kDjgt2z4j4nDxDZkK+6hr196JLzrsUfbEFn6FdQdJ8AAAAJcEhZcwAALiMAAC4jAXilP3YAAAPkSURBVFiFxVddTFpnGH44WjjyI8cfLHJKxDWZa514Ru2FWWS7W6eLtUYTKjdLdts1S7gzWYA1cTczWbpe705rokHrUuN2tejFLsrsEax2SzZxCNihAgqIWDi76DBMPn6kZH0uv+ec93nyne987/OKUCKsDldt8DBx17MbM+2Ej9j9WFIWPEhcAABVLX1SLxPH1EyNT9com1Ip6Pv2Qf1BKXVFxR4YneY5fis0sfTb31eixy+LPg8Ackm1YGxr2uBa6sxjwxxflgGrw8U884XnF1b9PfFkqhTdHEjFVejt1Cy3s0y/fVAfLtnA6DTP/fB0e9m9HZGXpXwGei0T/YRje0i7kWPAMvnr0MQvnqmdSKKqEuIZqJV0ytytM42PXJvJa2B0mue+X/rDWWnxDJqVdOpT42XD18OcK8eA1eFiHM6/vIW2nRKJ0NupwYDhEq6/1YBmpgYAEAgf4cmfe5hb2cbCqh9pQchrQq9loreuabWZM1GdIZ75wvOFxG90NGP8tgFXWWUOp1JIoNcy+OyDy1j3RWB5uIJFd4BYx+UNy99WK+YBGE93YHSa57798fnTfKfddqsDX958F5SopL8QaUHAvUdrsM26ibxUXIUvPnrnvbFhjqcAgN8KTRQStw50lCwOvPpU1oFX75EQT6bAb4UmAEBkdbhqv1lYD8eSqRyFGx3NeGz58Fzi2UgLAvrGfyZ+DrmkWrB8fIWhgoeJuyRxSiTC+G1D2eLFakSPX4qCh4k7lGc3ZiK93MdpiAfuvLjKKtHbqSFynt3YCLUTPmJJ5IDh0muLF6v1IpJgqf1YUkYiu1obKmagq7WeuL4XPZZSmZZ6FplLphLQ1EmJ68GDxAWqYiplglLV0ickIhA+qpiIPxQnrqtq6ROqXiaOkUjn5l7FDDg394nrDXJJnFIzNT4SObeyXTED+WpdVNI+StcomyKRj3k/1n2R1xZf90WwsOoncrpG2SSlUtD35ZLqnP6ZFgRYHq4UbK3FUKiGXFItqBT0A8o+qD8wtjVtkAosugO492itbANfza3lbcvGtqYN+6D+gAIArqXOLBWTQ5Bt1g3brPtcO5EWBNhm3bDP5W/HXEudGchKREPfLS3NPPH25CtaKJBko1ggAYCh69rlmc+NRiArEbWzTP/vO4delzdMTEWL7gB+Wls4jWRdrfWnN5w/FIdzc7/kSNbOMv2ZZPrGQ+l/ruKxYY43d+tMaiVd3iRSRHykW2fKFgf+x8Gkj2PfPyue1wBQ0dFsqZ1lbp5rNMvGGxtOz+Lf8fyOZzc28iKSYPeix9Ls8bxBLolfVNI+XaNsUqWgH5Q6nv8DZWzGeZcm0ZcAAAAASUVORK5CYII='
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
      // src: 'data:image/png;base64,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'
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
    layers: [vectorLayer],
    // Add vector drag to map interactions
    interactions: ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })
  // }).extend([new VectorDrag()])
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

    function updateMode () {
      $info.toggleClass('polygon')

      if ($info.hasClass('polygon')) {
        // Remove the point feature
        vectorSource.removeFeature(point)

        // Add the polygon draw interaction to the map
        map.addInteraction(modify)
        map.addInteraction(draw)
        map.addInteraction(snap)

        if (polygon) {
          vectorSource.addFeature(polygon)
        }

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
        featureMode = 'point'
      }

      updateTargetUrl()
    }

    $info.on('click', 'a.toggle', function (e) {
      e.preventDefault()
      updateMode()
    })

    // Click handler for pointer
    map.on('singleclick', function (e) {
      if (featureMode === 'point') {
        point.getGeometry().setCoordinates([e.coordinate[0], e.coordinate[1]])
        updateTargetUrl()
      }
    })

    function updateTargetUrl () {
      var coordinates
      var url = '/summary'

      if (featureMode === 'polygon' && polygon) {
        coordinates = polygon.getGeometry().getCoordinates()[0]
        url += '?polygon=' + JSON.stringify(coordinates.map(function (item) {
          return [parseInt(item[0], 10), parseInt(item[1], 10)]
        }))
      } else {
        coordinates = point.getGeometry().getCoordinates()
        url += '?easting=' + parseInt(coordinates[0], 10) + '&northing=' + parseInt(coordinates[1], 10)
      }

      $continueBtn.attr('href', url)
    }

    // if (window.history.pushState) {
    //   $continueBtn.on('click', function (e) {
    //     var title = document.title
    //     var url = '/confirm-location'
    //     var coordinates

    //     if (polygon) {
    //       coordinates = polygon.getGeometry().getCoordinates()[0]
    //       var firstPolygonPoint = coordinates[0]

    //       url += '?easting=' + parseInt(firstPolygonPoint[0], 10) + '&northing=' + parseInt(firstPolygonPoint[1], 10)
    //       url += '&polygon=' + JSON.stringify(coordinates.map(function (item) {
    //         return [parseInt(item[0], 10), parseInt(item[1], 10)]
    //       }))
    //     } else {
    //       coordinates = point.getGeometry().getCoordinates()
    //       url += '?easting=' + parseInt(coordinates[0], 10) + '&northing=' + parseInt(coordinates[1], 10)
    //     }

    //     window.history.pushState(coordinates, title, url)
    //   })

    //   window.onpopstate = function (e) {
    //     window.alert('location: ' + document.location + ', state: ' + JSON.stringify(e.state))
    //   }
    // }
  })
}

module.exports = ConfirmLocationPage
