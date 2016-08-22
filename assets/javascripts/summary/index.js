var ol = require('openlayers')
var Map = require('../map.js')
var mapConfig = require('../map-config.json')

function Summary (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)

  var mapOptions = {
    point: [parseInt(easting, 10), parseInt(northing, 10)],
    layers: [
      new ol.layer.Tile({
        ref: 'fmp',
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
      })
    ]
  }
  this.map = new Map(mapOptions)
}

module.exports = Summary
