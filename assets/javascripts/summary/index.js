var map = require('../map.js')

function Summary (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)
  map.loadMap(easting && [easting, northing], true)
}

module.exports = Summary
