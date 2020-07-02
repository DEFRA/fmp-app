const routes = [].concat(
  require('../routes/home'),
  require('../routes/location'),
  require('../routes/confirmation'),
  require('../routes/contact'),
  require('../routes/results'),
  require('../routes/public')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
