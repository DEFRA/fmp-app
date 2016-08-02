var sprintf = require('sprintf-js')
var util = require('../util')
var config = require('../../config').ordnanceSurvey
var urlNamesApi = config.urlNamesApi

function findByPlace (place, callback) {

  var uri = sprintf.vsprintf(urlNamesApi, [place, config.key])

  util.getJson(uri, function (err, payload) {
    if (err) {
      return callback(err)
    }

    if (!payload || !payload.results || !payload.results.length) {
      return callback(null, [])
    }

    var results = payload.results
    var gazetteerEntries = results.map(function (item) {
      return {
        geometry_x: item.GAZETTEER_ENTRY.GEOMETRY_X,
        geometry_y: item.GAZETTEER_ENTRY.GEOMETRY_Y
      }
    })

    callback(null, gazetteerEntries)
  })
}

module.exports = {
  findByPlace: findByPlace
}
