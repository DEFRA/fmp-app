const { version, revision } = require('../../version')
const externalHealthCheck = require('../services/external-health-check')

const GIT_REVISION_LENGTH = 7

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
          revision: revision.substring(0, GIT_REVISION_LENGTH)
        },
        fmpService,
        fmpApi
      }
      return h.view('about', data)
    }
  }
}
