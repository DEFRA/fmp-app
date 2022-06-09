const $ = require('jquery')

const VectorLayer = require('ol/layer/Vector').default
const VectorSource = require('ol/source/Vector').default
const Polygon = require('ol/geom/Polygon').default
const Point = require('ol/geom/Point').default
const MultiPoint = require('ol/geom/MultiPoint').default
const Feature = require('ol/Feature').default
const Style = require('ol/style/Style').default
const Stroke = require('ol/style/Stroke').default
const Fill = require('ol/style/Fill').default
const Icon = require('ol/style/Icon').default
const Modify = require('ol/interaction/Modify').default
const Draw = require('ol/interaction/Draw').default

const { defaults: InteractionDefaults } = require('ol/interaction')

const FMPMap = require('../map')
const { createTileLayer, mapState, getTargetUrl, getPolygonNodeIcon } = require('../map-utils')
const mapConfig = require('../map-config.json')
const VectorDrag = require('../vector-drag')
const dialog = require('../dialog')

const vectorDragInteraction = new VectorDrag()

const addOptionsFromSession = options => {
  const polygonFromSession = mapState.getItem('polygon')
  let pointFromSession = mapState.getItem('point')
  if (polygonFromSession) {
    options.polygon = JSON.parse(polygonFromSession)
  }
  if (pointFromSession) {
    pointFromSession = JSON.parse(pointFromSession)
    options.easting = pointFromSession[0]
    options.northing = pointFromSession[1]
  }
  return options
}

function ConfirmLocationPage (options) {
  options = addOptionsFromSession(options)
  const easting = window.encodeURIComponent(options.easting)
  const northing = window.encodeURIComponent(options.northing)
  const location = window.encodeURIComponent(options.location)
  const fullName = window.encodeURIComponent(options.fullName)
  const recipientemail = window.encodeURIComponent(options.recipientemail)

  const $page = $('#confirm-location-page')
  const $radios = $('.top-of-buttons', $page)
  const $continueBtn = $('a.govuk-button--start', $page)
  const $deleteButton = $('#deletePolygon')

  const point = new Feature({
    geometry: new Point([parseInt(easting, 10), parseInt(northing, 10)])
  })

  const vectorSource = new VectorSource({
    features: [
      point
    ]
  })

  // Styles for features
  const vectorStyle = function (feature, _resolution) {
    // Complete polygon drawing style
    const drawCompleteStyle = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.5)'
      }),
      stroke: new Stroke({
        color: '#B10E1E',
        width: 3
      }),
      image: getPolygonNodeIcon()
    })

    // Complete polygon geometry style
    const drawCompleteGeometryStyle = new Style({
      image: getPolygonNodeIcon(),
      // Return the coordinates of the first ring of the polygon
      geometry: function (feature) {
        if (feature.getGeometry().getType() === 'Polygon') {
          const coordinates = feature.getGeometry().getCoordinates()[0]
          return new MultiPoint(coordinates)
        } else {
          return null
        }
      }
    })

    // Point style
    const pointStyle = new Style({
      image: new Icon({
        // size: [53, 71],
        anchor: [0.5, 1],
        // scale: 0.5,
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: '/assets/images/iconfinder_marker.png'
      })
    })

    const featureType = feature.getGeometry().getType()

    if (featureType === 'Polygon') {
      return [drawCompleteStyle, drawCompleteGeometryStyle]
    }
    return [pointStyle]
  }

  const vectorLayer = new VectorLayer({
    ref: 'centre',
    visible: true,
    source: vectorSource,
    style: vectorStyle
  })

  // Start polygon drawing style
  const drawStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.5)'
    }),
    stroke: new Stroke({
      color: '#005EA5',
      width: 3
    }),
    image: getPolygonNodeIcon()
  })

  // Modify polygon drawing style
  const modifyStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.5)'
    }),
    stroke: new Stroke({
      color: '#FFBF47',
      width: 3
    }),
    image: getPolygonNodeIcon()
  })

  const modify = new Modify({
    source: vectorSource,
    style: modifyStyle
  })

  const draw = new Draw({
    source: vectorSource,
    type: 'Polygon',
    style: drawStyle
  })

  const mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [createTileLayer(mapConfig), vectorLayer],
    // Add vector drag to map interactions
    interactions: InteractionDefaults({
      altShiftDragRotate: false,
      pinchRotate: false
    }).extend([vectorDragInteraction])
  }

  this.map = new FMPMap(mapOptions)

  this.map.onReady(function (map) {
    let polygon
    let featureMode = 'point'

    let id, cookieTimer, cookiePattern
    const cookieName = 'pdf-download'

    function checkCookies () {
      // If the local cookies have been updated, clear the timer
      if (document.cookie.search(cookiePattern) >= 0) {
        clearInterval(cookieTimer)
        dialog.closeDialog()
      }
    }

    $('#report form').submit(function () {
      // Create the `id` variable. This is echoed back as
      // the cookie value to notify the download is complete
      id = (new Date()).getTime()
      $('input[name=id][type=hidden]', this).val(id)
      cookiePattern = new RegExp(cookieName + '=' + id, 'i')

      dialog.closeDialog()
      dialog.openDialog('#report-downloading')

      cookieTimer = window.setInterval(checkCookies, 500)
    })

    if (options.polygon) {
      // Load polygon from saved state
      polygon = new Feature({
        geometry: new Polygon([options.polygon])
      })
      updateMode('polygon')
    }

    modify.on('modifyend', function (e) {
      // Update polygon and targetUrl
      const features = e.features.getArray()
      polygon = features[0]
      updateTargetUrl()
    })

    draw.on('drawend', function (e) {
      const coordinates = e.feature.getGeometry().getCoordinates()[0]
      if (coordinates.length >= 4) {
        // Update polygon and targetUrl
        polygon = e.feature
        updateTargetUrl()
        setTimeout(function () {
          map.removeInteraction(draw)
        }, 500)
      }
    })

    $radios.on('click', 'input', function (e) {
      updateMode(e.target.getAttribute('id'))
    })

    $deleteButton.on('click', function (e) {
      if (polygon) {
        vectorSource.removeFeature(polygon)
        polygon = undefined
        updateMode('polygon')
      }
    })

    // switching off the flood-zone layer
    map.setLayerVisible('fmp', false)

    // Click handler for pointer
    map.on('singleclick', function (e) {
      if (featureMode === 'point') {
        point.getGeometry().setCoordinates([e.coordinate[0], e.coordinate[1]])
        updateTargetUrl()
      }
    })

    // Point movement handler
    map.getLayers().forEach(function (layer) {
      if (layer.getProperties().ref === 'centre') {
        layer.getSource().getFeatures()[0].on('change', function (e) {
          updateTargetUrl()
        })
      }
    })

    function updateMode (mode) {
      const radio = document.getElementById(mode)
      if (radio) {
        radio.checked = true
      }
      if (mode === 'polygon') {
        // Enabling the Delete shape button

        $deleteButton.attr('disabled', false)

        // Remove the point feature
        if (vectorSource.getFeatures().length > 0) {
          vectorSource.removeFeature(point)
        }

        // Add the polygon draw interaction to the map
        map.addInteraction(modify)

        if (polygon) {
          vectorSource.addFeature(polygon)
        } else {
          map.addInteraction(draw)
        }

        // add polygon class to legend to hide point and show polygon icon
        $radios.addClass('polygon')

        featureMode = 'polygon'
      } else {
        // disabling the Delete shape button
        $deleteButton.attr('disabled', true)

        // Remove the polygon draw interaction to the map
        map.removeInteraction(modify)
        map.removeInteraction(draw)

        if (polygon) {
          vectorSource.removeFeature(polygon)
        }

        // Add the point feature
        vectorSource.addFeature(point)

        // add polygon class to legend to hide point and show polygon icon
        $radios.removeClass('polygon')

        featureMode = 'point'
      }

      updateTargetUrl()
    }

    function updateTargetUrl () {
      const url = getTargetUrl(featureMode, polygon, point, location, fullName, recipientemail)
      $continueBtn.attr('href', url)
    }
  })
}

module.exports = ConfirmLocationPage
