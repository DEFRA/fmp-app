const { version, dataVersion } = require('../../package.json')

module.exports = {
  method: 'GET',
  path: '/about',
  options: {
    description: 'Describe application version number',
    handler: async (_request, h) => {
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
