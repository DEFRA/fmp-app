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

const FMPMap = require('../map')
const dialog = require('../dialog')
const mapConfig = require('../map-config.json')
const { fixMapTabOrder } = require('../map-tab-order')
const { createTileLayer } = require('../map-utils')

function Summary (options) {
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
    window.sessionStorage.setItem('polygon', JSON.stringify(options.polygon))
    window.sessionStorage.removeItem('point')
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
    window.sessionStorage.setItem('point', mapOptions.point)
    window.sessionStorage.removeItem('polygon')
  }
  const $summaryColumn = $('.summary-column')
  const $map = $('#map')
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
  this.map.onReady(function () {
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
      $('body').removeClass('modal-open')
    })
    fixMapTabOrder()
  })
}
module.exports = Summary
