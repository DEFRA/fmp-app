const routes = [].concat(
  require('../routes/home'),
  require('../routes/location'),
  require('../routes/confirmation'),
  require('../routes/contact'),
  require('../routes/results'),
  require('../routes/public'),
  require('../routes/login'),
  require('../routes/start-page')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
