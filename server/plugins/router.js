const routes = require('../routes')
const config = require('./../../config')

exports.plugin = {
  name: 'router',
  register: (server, options) => {
    if (!config.maintainence) {
      server.route(routes)
    } else {
      // var routesIndex= routes.findIndex()
      var maintainenceRoutes = routes.filter(item => {
        if (item.path === '/{path*}' || item.path === '/public/{path*}') {
          return item
        }
      })
      server.route(maintainenceRoutes)
    }
  }
}
