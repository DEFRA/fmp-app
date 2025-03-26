const constants = require('../constants')

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
        userAgent: encodeURIComponent(request.headers['user-agent'] || '')
      })
    }
  }
}
