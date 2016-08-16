var config = require('../../config').environmentVariables
var uri = config.gs_proxy_protocol + '://' + config.gs_proxy_host + ':' + config.gs_proxy_port + '/geoserver/fmp/wms'

module.exports = {
  method: 'GET',
  path: '/wms-proxy',
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
