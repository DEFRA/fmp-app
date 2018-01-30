const routes = require('../routes')

exports.plugin = {
  name: 'router',
  register: (server, options) => {
    server.route(routes)
  }
}
