const constants = require('../constants')
const { isSafeRedirect } = require('../common/utils/is-safe-redirect')

function getSafeExitSurveyHref (request) {
  const { referrer, host } = request.info
  const { protocol } = request.server.info

  if (!referrer || referrer.indexOf(constants.routes.FEEDBACK) > -1) {
    return '/'
  }

  if (isSafeRedirect(referrer)) {
    return referrer
  }

  try {
    const referrerUrl = new URL(referrer, `${protocol}://${host}`)
    const redirectUrl = `${referrerUrl.pathname}${referrerUrl.search}`
    return isSafeRedirect(redirectUrl) ? redirectUrl : '/'
  } catch {
    return '/'
  }
}

module.exports = {
  method: 'GET',
  path: constants.routes.FEEDBACK,
  options: {
    description: 'Get the feedback page',
    handler: async (request, h) => {
      const ref =
        request.info.referrer && request.info.referrer.indexOf(constants.routes.FEEDBACK) === -1
          ? request.info.referrer
          : request.server.info.protocol + '://' + request.info.host

      return h.view(constants.views.FEEDBACK, {
        ref: encodeURIComponent(ref),
        userAgent: encodeURIComponent(request.headers['user-agent'] || ''),
        href: getSafeExitSurveyHref(request)
      })
    }
  }
}
