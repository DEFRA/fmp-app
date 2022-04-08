/* global $ */
require('../dialog')

const TileLayer = require('ol/layer/Tile').default
const VectorLayer = require('ol/layer/Vector').default
const TileWMS = require('ol/source/TileWMS').default
const VectorSource = require('ol/source/Vector').default
const TileGrid = require('ol/tilegrid/TileGrid').default
const Polygon = require('ol/geom/Polygon').default
const Point = require('ol/geom/Point').default
const Feature = require('ol/Feature').default
const Style = require('ol/style/Style').default
const Stroke = require('ol/style/Stroke').default
const Fill = require('ol/style/Fill').default
const Icon = require('ol/style/Icon').default
const { defaults: InteractionDefaults } = require('ol/interaction')

const Map = require('../summary-review-map')
const mapConfig = require('../map-config.json')

function ApplicationSummaryReviewPage (options) {
  const mapOptions = {
    layers: [
      new TileLayer({
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
      })
    ],
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

  this.map = new Map(mapOptions)

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
