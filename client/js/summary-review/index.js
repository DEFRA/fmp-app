/* global $ */
const VectorLayer = require('ol/layer/Vector').default
const VectorSource = require('ol/source/Vector').default
const Polygon = require('ol/geom/Polygon').default
const Point = require('ol/geom/Point').default
const Feature = require('ol/Feature').default
const Style = require('ol/style/Style').default
const Stroke = require('ol/style/Stroke').default
const Fill = require('ol/style/Fill').default
const Icon = require('ol/style/Icon').default
const { defaults: InteractionDefaults } = require('ol/interaction')

const FMPMap = require('../summary-review-map')
const mapConfig = require('../map-config.json')
const { createTileLayer } = require('../map-utils')

function ApplicationSummaryReviewPage (options) {
  const mapOptions = {
    layers: [createTileLayer(mapConfig)],
    mapInteractions: InteractionDefaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })
  }

  if (options.polygon) {
    const polygon = new Polygon([options.polygon])
    mapOptions.polygon = polygon
    mapOptions.point = [parseInt(options.polygon[0][0], 10), parseInt(options.polygon[0][1], 10)]
    mapOptions.layers.push(
      new VectorLayer({
        ref: 'centre',
        visible: true,
        zIndex: 1,
        source: new VectorSource({
          features: [
            new Feature({
              geometry: polygon
            })]
        }),
        style: new Style({
          stroke: new Stroke({
            color: '#b21122',
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(178, 17, 34, 0.1)'
          })
        })
      }))
  } else {
    const easting = window.encodeURIComponent(options.easting)
    const northing = window.encodeURIComponent(options.northing)

    mapOptions.point = [parseInt(easting, 10), parseInt(northing, 10)]
    mapOptions.layers.push(
      new VectorLayer({
        ref: 'centre',
        visible: true,
        zIndex: 1,
        source: new VectorSource({
          features: [
            new Feature({
              geometry: new Point([parseInt(easting, 10), parseInt(northing, 10)])
            })]
        }),
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: '/assets/images/iconfinder_marker.png'
          })
        })
      }))
  }

  const $summaryColumn = $('.summary-column')
  const $map = $('#map')

  const setBlendMode = function (evt) {
    evt.context.globalCompositeOperation = 'multiply'
  }

  const resetBlendModeFromSelect = function (evt) {
    evt.context.globalCompositeOperation = 'source-over'
  }

  mapOptions.layers[0].on('precompose', setBlendMode)
  mapOptions.layers[0].on('postcompose', resetBlendModeFromSelect)

  this.map = new FMPMap(mapOptions)

  function isMobile () {
    return $('.visible-mobile:visible').length > 0
  }

  function sizeColumn () {
    const height = !isMobile() ? $summaryColumn.height() : 450
    $map.height(height)
  }

  // set start height
  sizeColumn()

  $(window).on('resize', sizeColumn)
}

module.exports = ApplicationSummaryReviewPage
