var map = require('./map')

function MapPage (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)
  map.loadMap(easting && [easting, northing])
}

module.exports = MapPage
