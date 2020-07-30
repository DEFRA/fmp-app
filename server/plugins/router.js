const routes = [].concat(
  require('../routes/home'),
  require('../routes/flood-zone3-results'),
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
  require('../routes/summary'),
  require('../routes/feedback'),
  require('../routes/pdf'),
  require('../routes/os-terms'),
  require('../routes/error'),
  require('../routes/cookies'),
  require('../routes/privacy-policy'),
  require('../routes/privacy-notice'),
  require('../routes/terms-conditions'),
  require('../routes/maintainence'))

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
