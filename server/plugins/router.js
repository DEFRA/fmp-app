const routes = [].concat(
  require('../routes/home'),
  require('../routes/flood-zone-results'),
  require('../routes/flood-zone-results-explained'),
  require('../routes/location'),
  require('../routes/confirm-location'),
  require('../routes/confirmation'),
  require('../routes/contact'),
  require('../routes/public'),
  require('../routes/england-only'),
  require('../routes/gwc-proxy'),
  require('../routes/os-get-capabilities'),
  require('../routes/os-maps-proxy'),
  require('../routes/feedback'),
  require('../routes/pdf'),
  require('../routes/os-terms'),
  require('../routes/error'),
  require('../routes/cookies'),
  require('../routes/accessibility-statement'),
  require('../routes/privacy-notice'),
  require('../routes/terms-and-conditions'),
  require('../routes/check-your-details'),
  require('../routes/maintenance'),
  require('../routes/404'),
  require('../routes/order-not-submitted'),
  require('../routes/about')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
