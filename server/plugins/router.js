const routes = [].concat(
  require('../routes/home'),
  require('../routes/flood-zone-results'),
  require('../routes/flood-zone-results-explained'),
  require('../routes/location'),
  require('../routes/confirm-location'),
  require('../routes/confirmation'),
  require('../routes/contact'),
  require('../routes/results'),
  require('../routes/public'),
  require('../routes/login'),
  require('../routes/not-england'),
  require('../routes/gwc-proxy'),
  require('../routes/os-get-capabilities'),
  require('../routes/os-maps-proxy'),
  require('../routes/summary'),
  require('../routes/feedback'),
  require('../routes/pdf'),
  require('../routes/os-terms'),
  require('../routes/error'),
  require('../routes/cookies'),
  require('../routes/accessibility-statement'),
  require('../routes/personal-information-charter'),
  require('../routes/privacy-notice'),
  require('../routes/terms-and-conditions'),
  require('../routes/check-your-details'),
  require('../routes/maintainence'))

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
