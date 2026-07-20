/* istanbul ignore file */
// This file can be ignored for test coverage as it is only responsible for configuring the crumb plugin,
// which is tested indirectly through the cookies plugin tests.
const { config } = require('../../config')

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined

module.exports = {
  plugin: require('@hapi/crumb'),
  options: {
    cookieOptions: {
      isSecure: config.siteUrl.startsWith('https'),
      path: '/'
    },
    skip: (request, _h) => {
      if (isTest) {
        return true
      }
      const skipPaths = ['/health-check', '/assets', '/public']
      return skipPaths.some((path) => request.path.startsWith(path))
    }
  }
}
