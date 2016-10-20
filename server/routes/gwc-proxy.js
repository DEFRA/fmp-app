var config = require('../../config')
var uri = config.geoserver + '/geoserver/gwc/service/wms'

module.exports = {
  method: 'GET',
  path: '/gwc-proxy',
  handler: {
    proxy: {
      mapUri: function (request, callback) {
        var url = uri + request.url.search
        callback(null, url)
      },
      passThrough: true
    }
  }
}
