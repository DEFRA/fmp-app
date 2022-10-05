const { version, dataVersion, buildVersion } = require('../../package.json')

module.exports = {
  method: 'GET',
  path: '/about',
  options: {
    description: 'Describe application version number',
    handler: async (_request, h) => {
      console.log('Package ==> ', version)
      const data = {
        version,
        dataVersion,
        buildVersion
      }
      return h.view('about', data)
    }
  }
}
