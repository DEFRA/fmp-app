var config = require('../../config').envVars
var uri = config.gs_proxy_protocol + '://' + config.gs_proxy_host + ':' + config.gs_proxy_port + '/geoserver/gwc/service/wms'

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
