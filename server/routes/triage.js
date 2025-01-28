const constants = require('../constants')

const handlers = {
  get: async (_request, h) => h.view(constants.views.TRIAGE),
  post: async (request, h) => {
    const { errorSummary, redirectTo } = validatePayload(request.payload)
    if (errorSummary.length > 0) {
      return h.view(constants.views.TRIAGE, {
        errorSummary
      })
    }
    return h.redirect(redirectTo)
  }
}

const validatePayload = payload => {
  const errorSummary = []
  const redirectTo = constants.triageRoutes[payload.triageOptions]
  if (!redirectTo) {
    errorSummary.push({
      text: 'Please select an option to continue',
      href: '#about-map'
    })
  }
  return {
    errorSummary,
    redirectTo
  }
}

module.exports = [
  {
    method: 'GET',
    path: constants.routes.TRIAGE,
    options: {
      description: 'Triage Page',
      handler: handlers.get
    }
  },
  {
    method: 'POST',
    path: constants.routes.TRIAGE,
    handler: handlers.post
  }
]
