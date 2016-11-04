var addressService = require('../../services/address')
var findByPlace = require('./find-by-place')

addressService.findByPlace = function (place, callback) {
  process.nextTick(function () {
    var result = findByPlace[place.toUpperCase()]
    callback(result ? null : new Error(`findByPlace mock not found for place [${place}]`), result)
  })
}
