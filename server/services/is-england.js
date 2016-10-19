var util = require('../util')
var config = require('../../config')
var url = config.service + '/is-england/'

module.exports = {
  get: function (easting, northing, callback) {
    if (!easting || !northing) {
      return process.nextTick(() => {
        callback(new Error('No point provided'))
      })
    }
    util.getJson(url + easting + '/' + northing, callback)
  }
}
