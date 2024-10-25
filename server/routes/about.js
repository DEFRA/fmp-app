const { version, revision } = require('../../version')
const externalHealthCheck = require('../services/external-health-check')

module.exports = {
  method: 'GET',
  path: '/about',
  options: {
    description: 'Describe application version number',
    handler: async (_request, h) => {
      const fmpService = await externalHealthCheck.getFmpServiceVersion()
      const fmpApi = await externalHealthCheck.getFmpApiVersion()

      const data = {
        fmpApp: {
          version: version.substring(0, version.lastIndexOf('-')),
          revision: revision.substring(0, 7)
        },
        fmpService,
        fmpApi
      }
      return h.view('about', data)
    }
  }
}
