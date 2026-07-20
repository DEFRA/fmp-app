const { config } = require('../config')

const cookieNamePolicy = config.cookie.name
const cookiePolicy = config.cookie.policy
const cookieConfig = config.cookie.config

function getCurrentPolicy (request, h) {
  let cookiesPolicy = request.state[cookieNamePolicy]

  if (!cookiesPolicy) {
    cookiesPolicy = createDefaultPolicy(h)
  }

  return cookiesPolicy
}

function createDefaultPolicy (h) {
  const cookiesPolicy = { confirmed: false, essential: true, analytics: false }

  h.state(cookieNamePolicy, cookiesPolicy, { ...cookiePolicy, ...cookieConfig })

  return cookiesPolicy
}

function updatePolicy (request, h, analytics) {
  const cookiesPolicy = getCurrentPolicy(request, h)

  cookiesPolicy.analytics = analytics
  cookiesPolicy.confirmed = true

  h.state(cookieNamePolicy, cookiesPolicy, { ...cookiePolicy, ...cookieConfig })

  // Remove the legacy GA cookie from the old implementation
  if (request.state.GA) {
    h.unstate('GA')
  }

  if (!analytics) {
    removeAnalytics(request, h)
  }
}

function removeAnalytics (request, h) {
  const googleCookiesRegex = /^_ga$|^_ga_.*$|^_gid$|^_gat_.*$|^_dc_gtm_.*$/

  for (const cookieName of Object.keys(request.state)) {
    if (googleCookiesRegex.test(cookieName)) {
      h.unstate(cookieName)
    }
  }
}

module.exports = {
  getCurrentPolicy,
  updatePolicy,
  removeAnalytics
}
