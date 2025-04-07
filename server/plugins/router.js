const routes = [].concat(
  require('../routes/defra-map'),
  require('../routes/triage'),
  require('../routes/results'),
  require('../routes/next-steps'),
  require('../routes/defra-map/map-config'),
  require('../routes/defra-map/styles'),
  require('../routes/home'),
  require('../routes/flood-zone-results-explained'),
  require('../routes/location'),
  require('../routes/confirmation'),
  require('../routes/contact'),
  require('../routes/public'),
  require('../routes/england-only'),
  require('../routes/feedback'),
  require('../routes/product-1'),
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
  require('../routes/health-check'),
  require('../routes/about'),
  require('../routes/how-to-use-rivers-and-sea-data')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
