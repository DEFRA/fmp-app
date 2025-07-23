const routes = [].concat(
  require('../routes/about'),
  require('../routes/accessibility-statement'),
  require('../routes/check-your-details'),
  require('../routes/confirmation'),
  require('../routes/contact'),
  require('../routes/cookies'),
  require('../routes/defra-map'),
  require('../routes/defra-map/map-config'),
  require('../routes/defra-map/styles'),
  require('../routes/england-only'),
  require('../routes/error'),
  require('../routes/feedback'),
  require('../routes/flood-zone-results-explained'),
  require('../routes/how-to-use-flood-zone-plus-climate-change'),
  require('../routes/health-check'),
  require('../routes/home'),
  require('../routes/location'),
  require('../routes/maintenance'),
  require('../routes/next-steps'),
  require('../routes/order-not-submitted'),
  require('../routes/os-terms'),
  require('../routes/privacy-notice'),
  require('../routes/product-1'),
  require('../routes/public'),
  require('../routes/results'),
  require('../routes/terms-and-conditions'),
  require('../routes/triage')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
