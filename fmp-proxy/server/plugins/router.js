const routes = [].concat(
  require('../routes/health-check'),
  require('../routes/esri-proxy'),
  require('../routes/esri-tiles-proxy'),
  require('../routes/esri-geocode-proxy'),
  require('../routes/os-proxy')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server) => {
      server.route(routes)
    }
  }
}
