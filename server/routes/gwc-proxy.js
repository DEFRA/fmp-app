const config = require('../../config')
const uri = config.geoserver + '/geoserver/gwc/service/wms'

module.exports = {
  method: 'GET',
  path: '/gwc-proxy',
  config: { auth: false },
  handler: {
    proxy: {
      mapUri: (request) => {
        return {
          uri: uri + request.url.search
        }
      },
      passThrough: true
    }
  }
}
