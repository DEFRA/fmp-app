var ol = require('openlayers')
var Map = require('../map.js')

function Summary (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

  var mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [
      new ol.layer.Image({
        ref: 'fmp',
        source: new ol.source.ImageWMS({
          url: '/wms-proxy',
          serverType: 'geoserver',
          params: {
            'LAYERS': 'fmp'
          }
        })
      })
    ]
  }
  this.map = new Map(mapOptions)
}

module.exports = Summary
