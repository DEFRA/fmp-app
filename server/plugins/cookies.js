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
          // Prevent the browser from caching view responses or storing them
          // in the back/forward cache (bfcache). Pages contain personalised
          // content (consent state, CSRF tokens, CSP nonces) that must be
          // fresh on every visit. Without this, the browser can restore a
          // stale page via the Back button that still contains the GTM script,
          // re-enabling tracking after the user has withdrawn consent.
          request.response.header('cache-control', 'no-store')

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
