const $ = require('jquery')

const TileLayer = require('ol/layer/Tile').default
const VectorLayer = require('ol/layer/Vector').default
const TileWMS = require('ol/source/TileWMS').default
const VectorSource = require('ol/source/Vector').default
const TileGrid = require('ol/tilegrid/TileGrid').default
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
const Snap = require('ol/interaction/Snap').default

const { defaults: InteractionDefaults } = require('ol/interaction')

const FMPMap = require('../map')
const mapConfig = require('../map-config.json')
const VectorDrag = require('../vector-drag')
const dialog = require('../dialog')

const vectorDragInteraction = new VectorDrag()

const addOptionsFromSession = (options) => {
  const polygonFromSession = window.sessionStorage.getItem('polygon')
  if (polygonFromSession) {
    console.log('we should use session polygon data here: ', polygonFromSession)
    options.polygon = JSON.parse(polygonFromSession)
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
  const $product4Btn = $('a.button-product4', $page)
  const $legend = $('.legend', $page)
  const $form = $('form.form', $page)
  const $center = $('input[name="center"]', $form)
  const $polygon = $('input[name="polygon"]', $form)
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
      image: new Icon({
        opacity: 1,
        size: [32, 32],
        scale: 0.5,
        src: '/assets/images/map-draw-cursor-2x.png'
      })
    })

    // Complete polygon geometry style
    const drawCompleteGeometryStyle = new Style({
      image: new Icon({
        opacity: 1,
        size: [32, 32],
        scale: 0.5,
        src: '/assets/images/map-draw-cursor-2x.png'
      }),
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
    image: new Icon({
      opacity: 1,
      size: [32, 32],
      scale: 0.5,
      src: '/assets/images/map-draw-cursor-2x.png'
    })
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
    image: new Icon({
      opacity: 1,
      size: [32, 32],
      scale: 0.5,
      src: '/assets/images/map-draw-cursor-2x.png'
    })
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

  const snap = new Snap({
    source: vectorSource
  })

  const mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [new TileLayer({
      ref: 'fmp',
      opacity: 0.7,
      zIndex: 0,
      source: new TileWMS({
        url: mapConfig.tileProxy,
        serverType: 'geoserver',
        params: {
          LAYERS: 'fmp:fmp',
          TILED: true,
          VERSION: '1.1.1'
        },
        tileGrid: new TileGrid({
          extent: mapConfig.tileExtent,
          resolutions: mapConfig.tileResolutions,
          tileSize: mapConfig.tileSize
        })
      })
    }),
    vectorLayer],
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
      if (mode === 'polygon') {
        // Enabling the Delete shape button
        $deleteButton.attr('disabled', false)

        // Remove the point feature
        if (vectorSource.getFeatures().length > 0) {
          vectorSource.removeFeature(point)
        }

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
        $radios.addClass('polygon')

        featureMode = 'polygon'
      } else {
        // disabling the Delete shape button
        $deleteButton.attr('disabled', true)

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
        $radios.removeClass('polygon')

        featureMode = 'point'
      }

      updateTargetUrl()
    }

    function updateTargetUrl () {
      let coordinates
      let url = '/flood-zone-results'
      let contactUrl = '/contact'

      if (featureMode === 'polygon' && polygon) {
        coordinates = polygon.getGeometry().getCoordinates()[0]
        const center = getCenterOfExtent(polygon.getGeometry().getExtent())
        const coords = JSON.stringify(coordinates.map(function (item) {
          return [parseInt(item[0], 10), parseInt(item[1], 10)]
        }))
        url += '?polygon=' + coords
        url += '&center=' + JSON.stringify(center)
        url += '&location=' + location
        url += '&fullName=' + fullName
        url += '&recipientemail=' + recipientemail

        contactUrl += '?polygon=' + coords
        contactUrl += '&center=' + JSON.stringify(center)
        contactUrl += '&location=' + location
        contactUrl += '&fullName=' + fullName
        contactUrl += '&recipientemail=' + recipientemail

        // set form values
        $center.attr('value', JSON.stringify(center))
        $polygon.attr('value', coords)
      } else {
        coordinates = point.getGeometry().getCoordinates()
        url += '?easting=' + parseInt(coordinates[0], 10) + '&northing=' + parseInt(coordinates[1], 10) + '&location=' + location + '&fullName=' + fullName + '&recipientemail=' + recipientemail
        contactUrl += '?easting=' + parseInt(coordinates[0], 10) + '&northing=' + parseInt(coordinates[1], 10) + '&location=' + location + '&fullName=' + fullName + '&recipientemail=' + recipientemail
        // set form values
        $center.attr('value', '[' + parseInt(coordinates[0], 10) + ',' + parseInt(coordinates[1], 10) + ']')
        $polygon.attr('value', '')
      }
      $continueBtn.attr('href', url)
      $product4Btn.attr('href', contactUrl)
    }

    function getCenterOfExtent (extent) {
      const X = extent[0] + (extent[2] - extent[0]) / 2
      const Y = extent[1] + (extent[3] - extent[1]) / 2
      return [parseInt(X, 10), parseInt(Y, 10)]
    }
  })
}

module.exports = ConfirmLocationPage
