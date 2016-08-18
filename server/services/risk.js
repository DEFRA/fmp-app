var util = require('../util')
var fmpService = require('../../config').envVars.fmp_service
var url = fmpService + '/test-db'

// TODO this needs to use the risk service, but only /test-db usable at the moment
module.exports = {
  get: function (location, callback) {
    if (!location) {
      return process.nextTick(() => {
        callback(new Error('No location'))
      })
    }
    util.getJson(url, callback)
  }
}
