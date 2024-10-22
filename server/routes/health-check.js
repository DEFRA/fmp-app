const { version, revision } = require('../../version')

module.exports = {
  method: 'GET',
  path: '/health-check',
  options: {
    description: 'Static health-check page for fmp-app',
    handler: async () => {
      return JSON.stringify({
        name: 'fmp-app',
        version: version.substring(0, version.lastIndexOf('-')),
        revision
      })
    }
  }
}
