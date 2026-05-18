const http2 = require('node:http2')
const { config } = require('../../config')
const { getCurrentPolicy, removeAnalytics } = require('../cookies')

const { constants: httpConstants } = http2

const cookieNamePolicy = config.cookie.name
const cookiePolicy = config.cookie.policy

module.exports = {
  plugin: {
    name: 'cookies',
    register: (server, _options) => {
      server.state(cookieNamePolicy, cookiePolicy)

      server.ext('onPreResponse', (request, h) => {
        const statusCode = request.response.statusCode

        if (
          request.response.variety === 'view' &&
          statusCode !== httpConstants.HTTP_STATUS_FORBIDDEN &&
          request.response.source.context
        ) {
          const cookiesPolicy = getCurrentPolicy(request, h)

          request.response.source.context.cookiesPolicy = cookiesPolicy
          request.response.source.context.currentPath = `${request.path}${request.url.search}`

          if (cookiesPolicy.confirmed && !cookiesPolicy.analytics) {
            removeAnalytics(request, h)
          }
        }

        return h.continue
      })
    }
  }
}
