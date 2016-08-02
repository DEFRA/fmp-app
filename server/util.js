var config = require('../config')
var wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})

function getJson (url, callback) {
  wreck.get(url, { json: true }, function (err, response, payload) {
    if (err || response.statusCode !== 200) {
      return callback(err || payload || new Error('Unknown error'))
    }
    callback(null, payload)
  })
}

module.exports = {
  getJson: getJson
}
