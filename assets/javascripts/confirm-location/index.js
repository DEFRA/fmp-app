var map = require('./map')

function ConfirmLocationPage (options) {
  var easting = window.encodeURIComponent(options.easting)
  var northing = window.encodeURIComponent(options.northing)
  map.loadMap(easting && [easting, northing])
}

module.exports = ConfirmLocationPage
