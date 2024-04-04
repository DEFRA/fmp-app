module.exports = {
  method: 'GET',
  path: '/about',
  options: {
    description: 'Describe application version number',
    handler: async (_request, h) => {
      // package.json must be included rather than at the top so that it can be mocked for testing
      // otherwise tests would need updating everytime the version changes
      const { version, dataVersion } = require('../../package.json')
      const shortVersion = version.split('-')[0]
      const data = {
        version: shortVersion,
        buildVersion: version,
        dataVersion
      }
      return h.view('about', data)
    }
  }
}
