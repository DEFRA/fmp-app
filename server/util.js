var config = require('../config')
var wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  getJson: function (url, callback) {
    wreck.get(url, { json: true }, function (err, response, payload) {
      if (err || response.statusCode !== 200) {
        return callback(err || payload || new Error('Unknown error'))
      }
      callback(null, payload)
    })
  }
}
